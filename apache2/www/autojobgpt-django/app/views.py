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
from .serializers import FeedbackSerializer, JobURLSerializer, JobDetailsSerializer

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

  def error_response(self, error):
    return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

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
