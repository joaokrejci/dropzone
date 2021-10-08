import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Upload } from "tus-js-client";
import "./Dropzone.css";
import LoadingBar from "./LoadingBar";

interface UploadableFile {
  file: File | null;
  progress: number;
  complete: boolean;
  error: boolean;
  url: string | null;
}

interface FileBundle {
  files: Array<UploadableFile>;
  custodian: string;
}

interface DropzoneProps {
  onSubmit: (files: Array<FileBundle>) => void;
}

const Dropzone = ({ onSubmit }: DropzoneProps) => {
  const [fileBundles, setFileBundles] = useState<Array<FileBundle>>([]);
  const [isHovering, setIsHovering] = useState<boolean>();
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(fileBundles);
  });

  const uploadFile = (
    file: File | null,
    index: number,
    bundleIndex: number
  ) => {
    const uploadableFile: UploadableFile = {
      file,
      progress: 0,
      complete: false,
      error: false,
      url: "",
    };

    if (!file) {
      uploadableFile.error = true;
      return uploadableFile;
    }

    function updateBundles() {
      setFileBundles((bundles) => {
        const newBundles = [...bundles];
        newBundles[bundleIndex].files[index] = uploadableFile;
        return newBundles;
      });
    }

    let upload = new Upload(file, {
      endpoint: "https://tusd.tusdemo.net/files/",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file?.name,
        filetype: file?.type,
      },
      onError: function () {
        uploadableFile.error = true;
        updateBundles();
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        uploadableFile.progress = (bytesUploaded / bytesTotal) * 100;
        updateBundles();
      },
      onSuccess: function () {
        uploadableFile.complete = true;
        uploadableFile.url = upload.url;
        updateBundles();
      },
    });

    upload.start();

    return uploadableFile;
  };

  function addFiles(files: Array<File | null>) {
    const uploadableFiles = files.map((file: File | null, index: number) =>
      uploadFile(file, index, fileBundles.length)
    );

    setFileBundles((bundle) => [
      ...bundle,
      {
        files: uploadableFiles,
        custodian: "Anonymous",
      },
    ]);
  }

  function handleDragOver(event: DragEvent<HTMLElement>): void {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLElement>): void {
    setIsHovering(false);
    event.preventDefault();
    event.stopPropagation();

    const { items, files } = event.dataTransfer;

    if (items) {
      addFiles(
        Array.from(items)
          .filter((item) => item.kind === "file")
          .map((i) => i.getAsFile())
      );
    } else {
      addFiles(Array.from(files));
    }
  }

  function handleDropzoneClick() {
    hiddenInputRef.current?.click();
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.currentTarget.files || []));
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={() => setIsHovering(true)}
      onDragExit={() => setIsHovering(false)}
      onDrop={handleDrop}
      onClick={handleDropzoneClick}
      className={`Dropzone ${isHovering ? "hovering" : ""}`}
    >
      <input
        type="file"
        multiple
        tabIndex={-1}
        className="hiddenInput"
        onChange={handleInputChange}
        ref={hiddenInputRef}
      />
      {fileBundles.length ? (
        <>
          <div className="Dropzone-Bundles">
            {fileBundles.map((bundle, index) => (
              <div className="Dropzone-ListContainer" key={index}>
                <label>Custodian: </label>
                <input
                  onClick={(event) => event.stopPropagation()}
                  type="text"
                  value={bundle.custodian}
                  onChange={({
                    target: { value },
                  }: ChangeEvent<HTMLInputElement>) => {
                    setFileBundles((bundles) => {
                      const newBundles = [...bundles];
                      newBundles[index].custodian = value;
                      return newBundles;
                    });
                  }}
                />
                <div className="Dropzone-List">
                  {bundle?.files.map((file, index1) => (
                    <div className="Dropzone-ListItem" key={index1}>
                      <img
                        height={18}
                        src="https://cdn-icons-png.flaticon.com/512/633/633585.png"
                      />
                      <span className="Dropzone-ListItem-FileName">
                        {file?.file?.name}
                      </span>
                      <LoadingBar percentage={file?.progress || 0} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="Dropzone-SubmitButton">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onSubmit(fileBundles);
              }}
            >
              Submit
            </button>
          </div>
        </>
      ) : (
        <p>Drop your files here or click to upload them.</p>
      )}
    </div>
  );
};

export default Dropzone;
