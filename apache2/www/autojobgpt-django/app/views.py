from django.shortcuts import redirect
from django.views.decorators.http import require_safe
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db import IntegrityError
from django.db.models import Case, When, Value, IntegerField
from django.http import Http404, HttpResponse
from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework import mixins
from rest_framework.decorators import api_view, permission_classes

from .models import Template, FillField, Job, TailoredDocument, Substitution, Status, DocumentType
from .models import DEFAULT_FILLFIELDS
from .serializers import CustomUserSerializer
from .serializers import StatusSerializer, JobSerializer
from .serializers import TemplateSerializer, FillFieldSerializer
from .serializers import TailoredDocumentSerializer, SubstitutionSerializer
from .serializers import RegenerateSerializer, JobURLSerializer, JobDetailsSerializer, StatusSerializer
from .gpt import ChatException
from .permissions import IsOwner

import logging

logger = logging.getLogger(__name__)


def app(request):
  return redirect(request.get_full_path() + "app")

### API ###

@require_safe
def csrf(request):
  return JsonResponse({"csrfToken": get_token(request)})

class CustomUserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
  serializer_class = CustomUserSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def media(request, path):
  if path.startswith("templates/"):
    model = Template
  elif path.startswith("tailoredDocuments/"):
    model = TailoredDocument
  else:
    raise Http404
  
  if path.endswith(".docx"):
    document = get_object_or_404(model, docx=path, user=request.user)
  elif path.endswith(".png"):
    document = get_object_or_404(model, png=path, user=request.user)

  file_path = settings.MEDIA_ROOT + path

  try:    
    with open(file_path, 'rb') as file:
      content = file.read()  # Read file content into memory
    response = HttpResponse(content, content_type='application/octet-stream')
    return response
  except IOError:
    raise Http404
  except Exception as e:
    raise Http404


class ModelViewSet(viewsets.ModelViewSet):
  permission_classes = [IsAuthenticated, IsOwner]

  def error_response(self, error):
    if isinstance(error, IntegrityError):
      error_message = str(error)
      user_friendly_error = "An integrity error occurred: {}."
      if "job_unique_title_company" in error_message:
        user_friendly_error = user_friendly_error.format("A job with this title and company already exists")
      elif "template_unique_name" in error_message:
        user_friendly_error = user_friendly_error.format("A template with this name already exists")
      elif "fill_field_unique_template_key" in error_message:
        user_friendly_error = user_friendly_error.format("A fill field with this key already exists for this template")
      else:
        if "Status" in error_message:
          user_friendly_error = user_friendly_error.format("You can't delete this job status because it's being used by a job")
        elif "Job" in error_message:
          user_friendly_error = user_friendly_error.format("You can't delete this job because it's being used by a resume or cover letter")
        elif "Template" in error_message:
          user_friendly_error = user_friendly_error.format("You can't delete this template because it's being used by a resume or cover letter")      
        else:
          user_friendly_error = user_friendly_error.format(error_message)
      return Response({"error": [user_friendly_error]}, status=status.HTTP_400_BAD_REQUEST)
    elif isinstance(error, ChatException):
      return Response({"error": [str(error)]}, status=status.HTTP_400_BAD_REQUEST)
    elif isinstance(error, ValidationError):
      return Response(error.detail, status=status.HTTP_400_BAD_REQUEST)
    else:
      return Response({"error": [error.__class__.__name__ + ": " + str(error) + "."]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
  def create(self, request, *args, **kwargs):
    try:
      return super().create(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
    
  def update(self, request, *args, **kwargs):
    try:
      return super().update(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
  
  def partial_update(self, request, *args, **kwargs):
    try:
      return super().partial_update(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
    
  def destroy(self, request, *args, **kwargs):
    try:
      return super().destroy(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
    
  def list(self, request, *args, **kwargs):
    try:
      return super().list(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
    
  def retrieve(self, request, *args, **kwargs):
    try:
      return super().retrieve(request, *args, **kwargs)
    except Exception as e:
      return self.error_response(e)
    
  def perform_create(self, serializer):
    serializer.save(user=self.request.user)
    return super().perform_create(serializer)
    
  def get_serializer_context(self):
    context = super().get_serializer_context()
    context.update({"request": self.request})
    return context


class StatusViewSet(ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = StatusSerializer
  
  def get_queryset(self):
    queryset = Status.objects.filter(user=self.request.user)
    return queryset
    
class JobViewSet(ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = JobSerializer
  
  def get_queryset(self):
    queryset = Job.objects.filter(user=self.request.user)
    return queryset

  @action(detail=False, methods=["get"], url_path="extract-details-from-url")
  def extract_details_from_url(self, request):
    url = request.query_params.get("url", None)
    urlSerializer = JobURLSerializer(data={"url": url})
    urlSerializer.is_valid(raise_exception=True)
    try:
      title, company, posting = self.serializer_class.Meta.model.extract_details_from_url(
        urlSerializer.validated_data["url"]
      )
    except Exception as e:
      return Response(
        {"error": str(e)},
        status=status.HTTP_400_BAD_REQUEST
      )    
    jobDetailsSerializer = JobDetailsSerializer(data={"title": title, "company": company, "posting": posting})
    jobDetailsSerializer.is_valid(raise_exception=True)
    return Response(jobDetailsSerializer.data)


class FillFieldViewSet(ModelViewSet):
  serializer_class = FillFieldSerializer

  def get_queryset(self):
    queryset = FillField.objects.filter(template__user=self.request.user)
    return queryset

class TemplateViewSet(ModelViewSet):
  serializer_class = TemplateSerializer

  def get_queryset(self):
    queryset = Template.objects.filter(user=self.request.user)
    document_type = self.request.query_params.get("type", None)
    if document_type is None:
      return queryset
    elif document_type in DocumentType.values:
      return queryset.filter(type=document_type)
    else:
      raise ValueError(f"Invalid template type: {document_type}")


class SubstitutionViewSet(ModelViewSet):
  serializer_class = SubstitutionSerializer

  def get_queryset(self):
    queryset = Substitution.objects.filter(user=self.request.user)
    # Annotate the queryset with a "priority" field
    # Substitutions with keys in DEFAULT_FILLFIELDS get priority 1, others get priority 2
    prioritized_queryset = queryset.annotate(
      priority=Case(
        When(key__in=DEFAULT_FILLFIELDS.keys(), then=Value(1)),
        default=Value(2),
        output_field=IntegerField()
      )
    ).order_by("priority")
    return prioritized_queryset

  @action(detail=True, methods=["post"], serializer_class=RegenerateSerializer)
  def regenerate(self, request, pk=None):    
    regenerate_serializer = RegenerateSerializer(data=request.data)
    regenerate_serializer.is_valid(raise_exception=True)
    
    value = regenerate_serializer.validated_data["value"]
    try:
      feedback = regenerate_serializer.validated_data["feedback"]
    except KeyError:
      feedback = None
    
    try:
      regenerated_object = self.get_object().regenerate(value, feedback)
    except Exception as e:
      return Response(
        {"error": str(e)},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    return Response(self.serializer_class(regenerated_object).data)

class TailoredDocumentViewSet(ModelViewSet):
  serializer_class = TailoredDocumentSerializer

  def get_queryset(self):
    queryset = TailoredDocument.objects.filter(user=self.request.user)
    document_type = self.request.query_params.get("type", None)
    if document_type is None:
      return queryset
    elif document_type in DocumentType.values:
      return queryset.filter(type=document_type)
    else:
      raise ValueError(f"Invalid template type: {document_type}")

  @action(detail=True, methods=["post"])
  def duplicate(self, request, pk=None):
    tailored_document = self.get_object()
    try:
      duplicated_tailored_document = tailored_document.duplicate()
    except Exception as e:
      return Response(
        {"error": str(e)},
        status=status.HTTP_400_BAD_REQUEST
      )
    return Response(self.serializer_class(duplicated_tailored_document).data)
