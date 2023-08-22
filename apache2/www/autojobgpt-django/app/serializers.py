from rest_framework import serializers

from .models import ResumeTemplate, FillField, JobPosting, ResumeProject, Resume, ResumeSubstitution


class ResumeTemplateSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeTemplate
    fields = "__all__"


class FillFieldSerializer(serializers.ModelSerializer):
  class Meta:
    model = FillField
    fields = "__all__"


class JobPostingSerializer(serializers.ModelSerializer):
  def create(self, validated_data):
    return self.Meta.model._default_manager.create(validated_data)

  class Meta:
    model = JobPosting
    fields = "__all__"


class ResumeProjectSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeProject
    fields = "__all__"


class ResumeSubstitutionSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeSubstitution
    fields = "__all__"

class FeedbackSerializer(serializers.Serializer):
  feedback = serializers.CharField()


class ResumeSerializer(serializers.ModelSerializer):
  substitutions = ResumeSubstitutionSerializer(many=True, read_only=True)

  class Meta:
    model = Resume
    fields = "__all__"
    extra_kwargs = {'upload': {'required': False}}