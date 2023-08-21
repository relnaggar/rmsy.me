from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register("templates", views.ResumeTemplateViewSet)
router.register("postings", views.JobPostingViewSet)
router.register("resumes", views.ResumeViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("", views.IndexView.as_view(), name="index"),
  path("<int:job_posting_id>/text", views.jobposting_text, name="jobposting_text"),
] 