from rest_framework import serializers

from .models import ResumeTemplate, FillField, Job, Resume, ResumeSubstitution


class ResumeTemplateSerializer(serializers.ModelSerializer):
  def create(self, validated_data):
    return self.Meta.model._default_manager.create(validated_data)

  class Meta:
    model = ResumeTemplate
    fields = "__all__"
    extra_kwargs = {'png': {'required': False}}


class FillFieldSerializer(serializers.ModelSerializer):
  class Meta:
    model = FillField
    fields = "__all__"


class JobSerializer(serializers.ModelSerializer):
  def create(self, validated_data):
    return self.Meta.model._default_manager.create(validated_data)

  class Meta:
    model = Job
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