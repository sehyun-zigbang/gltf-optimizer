import './index.css';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const filteredFiles = acceptedFiles.filter((file) =>
      /\.(glb|gltf)$/i.test(file.name)
    );
    setFiles(filteredFiles);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const promises: Promise<void>[] = [];

    files.forEach((file) => {
      promises.push(
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const data = event.target?.result as ArrayBuffer;
            zip.file(file.name, data);
            resolve();
          };
          reader.readAsArrayBuffer(file);
        })
      );
    });

    Promise.all(promises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const downloadUrl = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'files.zip';
        a.click();
      });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'gltf' : ['.glb, .gltf']}
  });

  return (
    <div className="file-uploader-container">
      <div className="file-uploader-box">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <p>Drag and drop GLB or GLTF files here, or click to select files</p>
        </div>
        {files.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button onClick={handleDownload} disabled={files.length === 0}>
        Download as ZIP
      </button>
    </div>
  );
};

export default FileUploader;

