from django.views.generic.list import ListView
from django.shortcuts import render, get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ResumeTemplate, FillField, Job, Resume, ResumeSubstitution
from .serializers import ResumeTemplateSerializer, FillFieldSerializer, JobSerializer, ResumeSerializer, ResumeSubstitutionSerializer
from .serializers import FeedbackSerializer

### VIEWS ###

class IndexView(ListView):
  model = Job


def job_text(request, job_id):
  return render(request, "job_text.html", {
    "job": get_object_or_404(Job, pk=job_id)
  })


### API ###

class ResumeTemplateViewSet(viewsets.ModelViewSet):
  queryset = ResumeTemplate.objects.all()
  serializer_class = ResumeTemplateSerializer


class FillFieldViewSet(viewsets.ModelViewSet):
  queryset = FillField.objects.all()
  serializer_class = FillFieldSerializer


class JobViewSet(viewsets.ModelViewSet):
  queryset = Job.objects.all()
  serializer_class = JobSerializer


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
      o = self.get_object()
      r = o.regenerate()
      s = self.serializer_class(r)
      d = s.data
      return Response(d)

class ResumeViewSet(RegeneratableViewSet):
  queryset = Resume.objects.all()
  serializer_class = ResumeSerializer

  @action(detail=True, methods=['get', 'post'])
  def fill(self, request, pk=None):
    Resume.objects.get(pk=pk).fill()
    return Response(self.serializer_class(self.get_object()).data)
  
  @action(detail=True, methods=['get', 'post'])
  def generate_docx(self, request, pk=None):
    Resume.objects.get(pk=pk).generate_docx()
    return Response(self.serializer_class(self.get_object()).data)
  
  @action(detail=True, methods=['get', 'post'])
  def regenerate(self, request, pk=None):
    return super().regenerate(request, pk)

class ResumeSubstitutionViewSet(RegeneratableViewSet):
  queryset = ResumeSubstitution.objects.all()
  serializer_class = ResumeSubstitutionSerializer

  @action(detail=True, methods=['get', 'post'])
  def regenerate(self, request, pk=None):
    return super().regenerate(request, pk)
