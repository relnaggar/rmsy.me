from rest_framework import serializers

from .models import ResumeTemplate, JobPosting

class ResumeTemplateSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeTemplate
    fields = "__all__"

class JobPostingSerializer(serializers.ModelSerializer):
  class Meta:
    model = JobPosting
    fields = "__all__"