from django.urls import include, path
from rest_framework import routers
from .views import ResumeTemplateViewSet, JobPostingViewSet, ResumeViewSet, ResumeFillFieldViewSet, ResumeSubstitutionViewSet
from .views import IndexView, jobposting_text

router = routers.DefaultRouter()
router.register("templates", ResumeTemplateViewSet)
router.register("postings", JobPostingViewSet)
router.register("resumes", ResumeViewSet)
router.register("fillfields", ResumeFillFieldViewSet)
router.register("substitutions", ResumeSubstitutionViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("", IndexView.as_view(), name="index"),
  path("<int:job_posting_id>/text", jobposting_text, name="jobposting_text"),
] 