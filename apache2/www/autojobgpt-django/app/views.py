from django.views.generic.list import ListView
from django.shortcuts import render, get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ResumeTemplate, JobPosting, Resume, ResumeFillField, ResumeSubstitution
from .serializers import ResumeTemplateSerializer, JobPostingSerializer, ResumeSerializer, ResumeFillFieldSerializer, ResumeSubstitutionSerializer
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


class JobPostingViewSet(viewsets.ModelViewSet):
  queryset = JobPosting.objects.all()
  serializer_class = JobPostingSerializer
  

class ResumeViewSet(viewsets.ModelViewSet):
  queryset = Resume.objects.all()
  serializer_class = ResumeSerializer


class ResumeFillFieldViewSet(viewsets.ModelViewSet):
  queryset = ResumeFillField.objects.all()
  serializer_class = ResumeFillFieldSerializer


class ResumeSubstitutionViewSet(viewsets.ModelViewSet):
  queryset = ResumeSubstitution.objects.all()
  serializer_class = ResumeSubstitutionSerializer

  @action(detail=True, methods=['get', 'post'])
  def regenerate(self, request, pk=None):
    serializer = FeedbackSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    feedback = serializer.validated_data['feedback']
    return Response(self.serializer_class(self.get_object().regenerate(feedback)).data)