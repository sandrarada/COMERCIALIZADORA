from django.contrib import admin
from django.urls import path,include
#Importamos las url de la app Products
from Products import urls as products_urls
from Admin import urls as admin_urls

#Importamos la configuracion de archivos media
from django.conf import settings
#Importamos la app de Admin para poder acceder a la interfaz de administrador
#from Admin import urls as admin_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('accounts/', include('django.contrib.auth.urls')), # Añade esta línea
    path('', include(products_urls)),
    path('adminCustom/', include(admin_urls)),
]

#configuracion extendida para archivos media
if settings.DEBUG == True:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL,document_root = settings.MEDIA_ROOT)