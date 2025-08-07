import { useContext, useEffect, useState } from "react";

import { MdDeleteForever } from "react-icons/md";
import { ExpensesContext } from "../../../../store/expense-context";

export default function AddReceiptModal({
  toggleModal,
  onSaveReceipts,
  savedFiles = [],
  receiptFiles,
  setReceiptFiles,
}) {
  const expenseCtx = useContext(ExpensesContext);

  // const {receiptFiles, setReceiptFiles} = props
  const [receiptPreviewUrls, setReceiptPreviewUrls] = useState([]);
  const [newSavedFiles, setNewSavedFiles] = useState(savedFiles);

  // Generate previews from receiptFiles
  useEffect(() => {
    const fileReaders = [];
    const urls = [];

    receiptFiles.forEach((file) => {
      const fileReader = new FileReader();
      fileReaders.push(fileReader);

      fileReader.onload = () => {
        urls.push(fileReader.result);
        if (urls.length === receiptFiles.length) {
          setReceiptPreviewUrls(urls);
        }
      };

      fileReader.readAsDataURL(file);
    });

    return () => {
      fileReaders.forEach((reader) => {
        if (reader.readyState === 1) {
          reader.abort();
        }
      });
    };
  }, [receiptFiles]);

  const fileSelectedHandler = (event) => {
    const newFiles = Array.from(event.target.files);
    setReceiptFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  function handleSave() {
    onSaveReceipts(receiptFiles);
    toggleModal();
  }

  function handleDelete(indexToRemove) {
    setReceiptFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setReceiptPreviewUrls((prevUrls) =>
      prevUrls.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleDeleteSavedFile(fileId) {
    const BASE_URL = import.meta.env.VITE_BASE_URL || "";

    try {
      const res = await fetch(`${BASE_URL}/expenses/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete file");

      // Update local savedFiles state
      setNewSavedFiles((prev) => prev.filter((file) => file.id !== fileId));
      expenseCtx.triggerUpdate();
      expenseCtx.triggerSucessOrFailMessage("success", res.message);
    } catch (err) {
      console.error(err);
      expenseCtx.triggerSucessOrFailMessage("fail", "Save failed");

      alert("Failed to delete receipt file");
    }
  }
  console.log(newSavedFiles);
  return (
    <div
      className=" bg-white py-5 md:px-20 rounded-md text-center shadow-md w-[15rem] md:w-[30rem] relative"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center ">
          <p className="font-semibold text-sm text-gray-600 mb-2 ">Receipts</p>
          <label
            className="flex items-center justify-center w-[10rem] md:w-[20rem] h-[3rem] 
                          rounded-md bg-transparent text-black border border-blue-500 cursor-pointer
                         hover:bg-blue-500 hover:text-white transition-all duration-300 text-center"
          >
            <input
              type="file"
              accept="*"
              multiple
              onChange={(e) =>
                fileSelectedHandler(e, setReceiptFiles, setReceiptPreviewUrls)
              }
              className="hidden"
            />
            Attach Receipt
          </label>

          {receiptFiles.length > 0 && (
            <div className="w-full mt-4">
              <ul className="text-gray-800 border border-blue-500 py-5 px-1 rounded-md">
                {receiptFiles.map((file, index) => (
                  <div
                    className="flex gap-3 text-xs justify-between px-3"
                    key={index}
                  >
                    <li className="text-xs">
                      {index + 1}. {file.name}
                    </li>
                    <button onClick={() => handleDelete(index)}>
                      <MdDeleteForever className="text-red-500" />
                    </button>
                  </div>
                ))}
              </ul>
            </div>
          )}
          {newSavedFiles?.length > 0 && (
            <div className="w-full mt-4">
              <p className="text-xs text-gray-600 font-semibold mb-1">
                Already Uploaded Receipts:
              </p>
              <ul className="text-xs border border-gray-300 rounded p-2 max-h-32 overflow-y-auto">
                {savedFiles.map((file, idx) => (
                  <li
                    key={file.id}
                    className="flex justify-between items-center"
                  >
                    <a
                      href={`${import.meta.env.VITE_BASE_URL}/${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Receipt {idx + 1} –{" "}
                      {new Date(file.upload_date).toLocaleDateString()}
                    </a>
                    <button onClick={() => handleDeleteSavedFile(file.id)}>
                      <MdDeleteForever className="text-red-500 cursor-pointer" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-500 w-[10rem] md:w-[20rem] text-white py-2 px-3 rounded-sm hover:bg-blue-400 transition duration-400"
        >
          Save Receipts
        </button>
      </div>
    </div>
  );
}
