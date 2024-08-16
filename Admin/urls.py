from django.urls import path

from .views import *


urlpatterns = [
    #Principal
    path('', adminHome, name='adminHome'),
    path('AccountSettings/', AccountSettingsView.as_view(), name='AccountSettingsView'),
    #Categorias
    path('View/Categories/', CategoriesView.as_view(), name='CategoriesView'),
    path('View/Products/', ProductsView.as_view(), name='ProductsView'),

    #Autenticacion
    path('accounts/login/', LoginUser, name='login'),
    path('accounts/logout/', userLogout, name='logout'),
    path('accounts/register/', registrar, name='register'),
    path('accounts/recovery/', password_reset_request, name='recovery'),
    #path('accounts/register2/', register, name='login'),
]