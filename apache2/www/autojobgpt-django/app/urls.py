from django.urls import include, path
from rest_framework import routers
from .views import StatusViewSet, TemplateViewSet, FillFieldViewSet, JobViewSet, ResumeViewSet, SubstitutionViewSet
from .views import app, csrf

router = routers.DefaultRouter()
router.register("statuses", StatusViewSet)
router.register("jobs", JobViewSet)
router.register("templates", TemplateViewSet)
router.register("fillFields", FillFieldViewSet)
router.register("resumes", ResumeViewSet)
router.register("substitutions", SubstitutionViewSet, basename="substitutions")

urlpatterns = [
  path("api/csrf/", csrf),
  path("api/", include(router.urls)),  
  path("", app, name="index"),
] 