from django.views.generic.list import ListView
from django.shortcuts import redirect, render, get_object_or_404

from rest_framework import status
from rest_framework.response import Response

from .models import JobPosting

class IndexView(ListView):
  model = JobPosting

def jobposting_text(request, job_posting_id):
  return render(request, "jobposting_text.html", {
    "job_posting": get_object_or_404(JobPosting, pk=job_posting_id)
  })

from rest_framework import viewsets

from .models import ResumeTemplate
from .serializers import ResumeTemplateSerializer, JobPostingSerializer

class ResumeTemplateViewSet(viewsets.ModelViewSet):
  queryset = ResumeTemplate.objects.all()
  serializer_class = ResumeTemplateSerializer

class JobPostingViewSet(viewsets.ModelViewSet):
  queryset = JobPosting.objects.all()
  serializer_class = JobPostingSerializer

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    instance = serializer.create(serializer.validated_data)
    instance.scrape()
    instance.extract_job_details()
    instance.save()
    serializer = self.get_serializer(instance)

    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)