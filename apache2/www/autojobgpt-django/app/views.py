from django.views.generic.list import ListView
from django.shortcuts import render, get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ResumeTemplate, FillField, JobPosting, ResumeProject, Resume, ResumeSubstitution
from .serializers import ResumeTemplateSerializer, FillFieldSerializer, JobPostingSerializer, ResumeProjectSerializer, ResumeSerializer, ResumeSubstitutionSerializer
from .serializers import FeedbackSerializer

### VIEWS ###

class IndexView(ListView):
  model = JobPosting


def jobposting_text(request, job_posting_id):
  return render(request, "jobposting_text.html", {
    "job_posting": get_object_or_404(JobPosting, pk=job_posting_id)
  })


### API ###

class ResumeTemplateViewSet(viewsets.ModelViewSet):
  queryset = ResumeTemplate.objects.all()
  serializer_class = ResumeTemplateSerializer


class FillFieldViewSet(viewsets.ModelViewSet):
  queryset = FillField.objects.all()
  serializer_class = FillFieldSerializer


class JobPostingViewSet(viewsets.ModelViewSet):
  queryset = JobPosting.objects.all()
  serializer_class = JobPostingSerializer


class ResumeProjectViewSet(viewsets.ModelViewSet):
  queryset = ResumeProject.objects.all()
  serializer_class = ResumeProjectSerializer

class RegeneratableViewSet(viewsets.ModelViewSet):
  def regenerate(self, request, pk=None):
    if request.method == 'GET':
      serializer = FeedbackSerializer(data=request.query_params)
    elif request.method == 'POST':
      serializer = FeedbackSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    feedback = serializer.validated_data['feedback']
    return Response(self.serializer_class(self.get_object().regenerate(feedback)).data)

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
