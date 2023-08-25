from django.urls import include, path
from rest_framework import routers
from .views import ResumeTemplateViewSet, FillFieldViewSet, JobViewSet, ResumeViewSet, ResumeSubstitutionViewSet
from .views import IndexView, job_text

router = routers.DefaultRouter()
router.register("templates", ResumeTemplateViewSet)
router.register("fillfields", FillFieldViewSet)
router.register("jobs", JobViewSet)
router.register("resumes", ResumeViewSet)
router.register("resumesubstitutions", ResumeSubstitutionViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("", IndexView.as_view(), name="index"),
  path("<int:job_id>/text", job_text, name="job_text"),
] 