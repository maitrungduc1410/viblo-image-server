import { useEffect, useRef, useState } from "react";
import { FileUpload, FileUploadUploadEvent } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

type TImage = {
  tiny: string;
  full: string;
  path: string;
};

function App() {
  const toast = useRef<Toast>(null);
  const [files, setFiles] = useState<TImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api");
      const json = await response.json();
      setFiles(json);
    })();
  }, []);

  const onUpload = (e: FileUploadUploadEvent) => {
    const response = JSON.parse(e.xhr.response);
    setFiles([...response, ...files]);
    toast.current!.show({
      severity: "success",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  const selectImage = (path: string) => {
    setSelectedImage(path);
    setVisible(true);
  };

  const deleteImage = async (path: string) => {
    try {
      const filename = path.split("/").pop();
      await fetch(`/api/${filename}`, {
        method: "DELETE",
      });

      setFiles(files.filter((item) => item.path !== path));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <Toast ref={toast}></Toast>
      <ConfirmPopup />

      <FileUpload
        auto
        multiple
        mode="basic"
        name="files"
        url="/api/upload"
        accept="image/*"
        onUpload={onUpload}
      />
      <div className="mt-3">
          {files.map((item) => (
            <div key={item.path} className="relative">
              <a href={item.path} className="progressive replace">
                <img
                  src={item.tiny}
                  className="preview"
                  alt="image"
                  loading="lazy"
                />
              </a>
              <div className="bg-overlay absolute top-0 left-0 right-0 bottom-0 flex align-items-center justify-content-center opacity-0 hover:opacity-1 transition-all transition-duration-200 gap-2">
                <Button
                  icon="pi pi-eye"
                  onClick={() => selectImage(item.full)}
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  onClick={(e) =>
                    confirmPopup({
                      target: e.currentTarget,
                      message: "Are you sure you want to proceed?",
                      icon: "pi pi-exclamation-triangle",
                      defaultFocus: "accept",
                      accept: () => deleteImage(item.path),
                    })
                  }
                />
              </div>
            </div>
          ))}
      </div>
      <Dialog
        header="Preview"
        visible={visible}
        className="w-6"
        onHide={() => setVisible(false)}
        closeOnEscape
      >
        <Image src={selectedImage} alt="Image" width="100%" />
      </Dialog>
    </div>
  );
}

export default App;
