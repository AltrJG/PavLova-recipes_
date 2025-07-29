from storages.backends.azure_storage import AzureStorage
import os

class ModelPrivateAzureStorage(AzureStorage):
    azure_container = 'modelos'
    account_name = os.environ.get('AZURE_ACCOUNT_NAME')
    account_key = os.environ.get('AZURE_ACCOUNT_KEY')
    expiration_secs = None
    overwrite_files = True
    azure_ssl = True