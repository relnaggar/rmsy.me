from django.urls import include, path
from rest_framework import routers
from .views import ResumeTemplateViewSet, FillFieldViewSet, JobViewSet, ResumeViewSet, ResumeSubstitutionViewSet
from .views import app, csrf

router = routers.DefaultRouter()
router.register("jobs", JobViewSet)
router.register("templates", ResumeTemplateViewSet)
router.register("fillfields", FillFieldViewSet)
router.register("resumes", ResumeViewSet)
router.register("resumesubstitutions", ResumeSubstitutionViewSet)

urlpatterns = [
  path("api/csrf/", csrf),
  path("api/", include(router.urls)),  
  path("", app, name="index"),
] 