const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    
    const connectionString = "su cadena del blob aca";
    const containerName = "practica2semi1a1s2026archivosg0"; 

    try {
        // verificar datos del front
        const { fileName, fileType, fileBase64 } = req.body;

        if (!fileName || !fileBase64 || !fileType) {
            context.res = {
                status: 400,
                body: { error: "Petición incompleta: requiere fileName, fileType y fileBase64" }
            };
            return;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // ya nos envian el nombre desde el front
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        
        // Convertimos el contenido base64 a binario
        const buffer = Buffer.from(fileBase64, 'base64');
        
        // contenedor definiendo el ContentType para visualización inmediata
        await blockBlobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: { blobContentType: fileType }
        });
        
        context.res = {
            status: 200,
            body: { 
                url: blockBlobClient.url, 
                message: "Archivo almacenado en la nube" 
            },
            headers: { 'Content-Type': 'application/json' }
        };        
    } catch (error) {
        context.log.error("Error en la transferencia a Blob:", error.message);
        context.res = { 
            status: 500, 
            body: "Error crítico durante la carga al storage"
        };
    }
};