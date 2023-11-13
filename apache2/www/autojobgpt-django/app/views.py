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
from .serializers import FeedbackSerializer

def app(request):
  return redirect(request.get_full_path() + 'app')

### API ###

@require_safe
def csrf(request):
  return JsonResponse({'csrfToken': get_token(request)})

class ResumeTemplateViewSet(viewsets.ModelViewSet):
  queryset = ResumeTemplate.objects.all()
  serializer_class = ResumeTemplateSerializer

  def update(self, request, *args, **kwargs):
    try:
      return super().update(request, *args, **kwargs)
    except IntegrityError as e:
        content = {'error': 'integrity error', 'details': str(e)}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)

class FillFieldViewSet(viewsets.ModelViewSet):
  queryset = FillField.objects.all()
  serializer_class = FillFieldSerializer

class JobViewSet(viewsets.ModelViewSet):
  queryset = Job.objects.all()
  serializer_class = JobSerializer

  @action(detail=True, methods=['get', 'post'])
  def apply(self, request, pk=None):
    if request.method == 'GET':
      chosen_resume_id = self.request.query_params.get('chosen_resume_id', None)
    elif request.method == 'POST':
      chosen_resume_id = self.request.data.get('chosen_resume_id', None)
    chosen_resume = Resume.objects.get(pk=chosen_resume_id)  
    self.get_object().apply(chosen_resume)
    return Response(self.serializer_class(self.get_object()).data)


class RegeneratableViewSet(viewsets.ModelViewSet):
  def regenerate(self, request, pk=None):
    serializer = None
    if request.method == 'GET' and 'feedback' in request.query_params:
      serializer = FeedbackSerializer(data=request.query_params)
    elif request.method == 'POST' and 'feedback' in request.data:
      serializer = FeedbackSerializer(data=request.data)
    if serializer is not None:
      serializer.is_valid(raise_exception=True)
      feedback = serializer.validated_data['feedback']
      return Response(self.serializer_class(self.get_object().regenerate(feedback)).data)
    else:
      return Response(self.serializer_class(self.get_object().regenerate()).data)

class ResumeViewSet(RegeneratableViewSet):
  queryset = Resume.objects.all()
  serializer_class = ResumeSerializer
  
  @action(detail=True, methods=['get', 'post'])
  def regenerate(self, request, pk=None):
    return super().regenerate(request, pk)

class ResumeSubstitutionViewSet(RegeneratableViewSet):
  queryset = ResumeSubstitution.objects.all()
  serializer_class = ResumeSubstitutionSerializer

  @action(detail=True, methods=['get', 'post'])
  def regenerate(self, request, pk=None):
    return super().regenerate(request, pk)
