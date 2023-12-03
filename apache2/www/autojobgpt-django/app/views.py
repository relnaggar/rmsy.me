from django.shortcuts import redirect
from django.views.decorators.http import require_safe
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db import IntegrityError

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ResumeTemplate, FillField, Job, Resume, ResumeSubstitution
from .serializers import ResumeTemplateSerializer, FillFieldSerializer, JobSerializer, ResumeSerializer, ResumeSubstitutionSerializer
from .serializers import RegenerateSerializer, JobURLSerializer, JobDetailsSerializer

def app(request):
  return redirect(request.get_full_path() + 'app')

### API ###

@require_safe
def csrf(request):
  return JsonResponse({'csrfToken': get_token(request)})

class ModelViewSetWithErrorHandling(viewsets.ModelViewSet):
  def error_response(self, error):
    user_friendly_error = "An integrity error occurred: {}."

    if "unique_name" in error:
      user_friendly_error = user_friendly_error.format("This resume template name already exists. Please choose a different name")
    elif "unique_title_company" in error:
      user_friendly_error = user_friendly_error.format("A job with this title and company already exists")
    else:
      if "Job" in error:
        user_friendly_error = user_friendly_error.format("You cannot delete this job because it is being used by a resume")
      elif "ResumeTemplate" in error:
        user_friendly_error = user_friendly_error.format("You cannot delete this resume template because it is being used by a resume")
      else:
        user_friendly_error = user_friendly_error.format(error)

    return Response({'error': user_friendly_error}, status=status.HTTP_400_BAD_REQUEST)

  def create(self, request, *args, **kwargs):
    try:
      return super().create(request, *args, **kwargs)
    except IntegrityError as e:
      return self.error_response(str(e))
    
  def update(self, request, *args, **kwargs):
    try:
      return super().update(request, *args, **kwargs)
    except IntegrityError as e:
      return self.error_response(str(e))
  
  def partial_update(self, request, *args, **kwargs):
    try:
      return super().partial_update(request, *args, **kwargs)
    except IntegrityError as e:
      return self.error_response(str(e))
    
  def destroy(self, request, *args, **kwargs):
    try:
      return super().destroy(request, *args, **kwargs)
    except IntegrityError as e:
      return self.error_response(str(e))

 
class JobViewSet(ModelViewSetWithErrorHandling):
  queryset = Job.objects.all()
  serializer_class = JobSerializer

  @action(detail=False, methods=['get'], url_path='extract-details-from-url')
  def extract_details_from_url(self, request):
    url = request.query_params.get('url', None)
    urlSerializer = JobURLSerializer(data={'url': url})
    urlSerializer.is_valid(raise_exception=True)
    try:
      title, company, posting = self.serializer_class.Meta.model.extract_details_from_url(
        urlSerializer.validated_data['url']
      )
    except Exception as e:
      return Response(
        {'error': str(e)},
        status=status.HTTP_400_BAD_REQUEST
      )    
    jobDetailsSerializer = JobDetailsSerializer(data={'title': title, 'company': company, 'posting': posting})
    jobDetailsSerializer.is_valid(raise_exception=True)
    return Response(jobDetailsSerializer.data)


class FillFieldViewSet(viewsets.ModelViewSet):
  queryset = FillField.objects.all()
  serializer_class = FillFieldSerializer

class ResumeTemplateViewSet(ModelViewSetWithErrorHandling):
  queryset = ResumeTemplate.objects.all()
  serializer_class = ResumeTemplateSerializer


class ResumeSubstitutionViewSet(ModelViewSetWithErrorHandling):
  queryset = ResumeSubstitution.objects.all()
  serializer_class = ResumeSubstitutionSerializer

  @action(detail=True, methods=['post'])
  def regenerate(self, request, pk=None):    
    regenerate_serializer = RegenerateSerializer(data=request.data)
    regenerate_serializer.is_valid(raise_exception=True)
    value = regenerate_serializer.validated_data['value']
    try:
      feedback = regenerate_serializer.validated_data['feedback']
    except KeyError:
      feedback = None
    
    try:
      if feedback is None:
        regenerated_object = self.get_object().regenerate(value)
      else:
        regenerated_object = self.get_object().regenerate(value, feedback)
    except Exception as e:
      return Response(
        {'error': str(e)},
        status=status.HTTP_400_BAD_REQUEST
      )
    
    return Response(self.serializer_class(regenerated_object).data)

class ResumeViewSet(ModelViewSetWithErrorHandling):
  queryset = Resume.objects.all()
  serializer_class = ResumeSerializer
