import { useEffect } from "react";
import { useDropzone } from "react-dropzone";

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
  };

export default function SubidaImagenes({files, setFiles, thumb, thumbInner}){

    const {getRootProps, getInputProps} = useDropzone({
      accept: {
        'image/*': []
      },
      maxFiles: 1,
      multiple: false,
      onDrop: acceptedFiles => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        })));
      }
    });
    
    const thumbs = files.map(file => (
      <div style={thumb} key={file.name}>
        <div style={thumbInner}>
          <img
            src={file.preview}
            style={img}
            // Revoke data uri after image is loaded
            onLoad={() => { URL.revokeObjectURL(file.preview) }}
          />
        </div>
      </div>
    ));
  
    useEffect(() => {
      // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
      return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    useEffect(() => {
        setFiles([]);
    }, [])

    return(
        <section>
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <p>Coloca tu imagen aqui...</p>
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
                {files.length != 0 && <p className="imagenTexto">Esta Imagen sera la que se utilizara</p>}
            </aside>
        </section>
    )
}