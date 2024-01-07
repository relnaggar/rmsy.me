from django.urls import include, path

from rest_framework import routers

from .views import app, csrf, media
from .views import CustomUserViewSet
from .views import StatusViewSet, TemplateViewSet, FillFieldViewSet, JobViewSet, TailoredDocumentViewSet, SubstitutionViewSet


router = routers.DefaultRouter()
router.register("users", CustomUserViewSet, basename="users")
router.register("statuses", StatusViewSet, basename="statuses")
router.register("jobs", JobViewSet, basename="jobs")
router.register("templates", TemplateViewSet, basename="templates")
router.register("fillFields", FillFieldViewSet, basename="fillFields")
router.register("tailoredDocuments", TailoredDocumentViewSet, basename="tailoredDocuments")
router.register("substitutions", SubstitutionViewSet, basename="substitutions")

urlpatterns = [
  path("", app, name="index"),
  path("api/", include(router.urls)),
  path("api/csrf/", csrf),
  path("api/media/<path:path>", media, name="media"),
] 