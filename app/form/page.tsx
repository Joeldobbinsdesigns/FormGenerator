"use client";
import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import formSpec from "@/data/formSpec.json";

export default function Form() {
  const [formFields, setFormFields] = useState<FormFields>({});
  const [showJsonRequest, setShowJsonRequest] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showHelpText, setShowHelpText] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  interface HandleChange {
    (fieldName: string, value: string | number | Date): void;
  }

  const handleChange: HandleChange = (fieldName, value) => {
    setFormFields((prev: FormFields) => ({ ...prev, [fieldName]: value }));
  };

  interface FormField {
    fieldid: string;
    fieldName: string;
    title: string;
    helpText?: string;
    fieldType: "text" | "numberInt" | "select" | "datetime" | "photo";
    defautVal?: string;
    dropVals?: string;
    category: string;
    fieldOrder: number;
    requiresPhoto?: number;
    commentField?: number;
    commentFieldName?: string;
    inputReq?: number;
  }

  interface FormFields {
    [key: string]: string | number | File | Date | undefined;
  }

  const changePhoto = (fieldName: string, file: File) => {
    setFormFields((prev: FormFields) => ({ ...prev, [fieldName]: file.name }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const missingRequired: string[] = [];

    formSpec.forEach((field) => {
      if (field.inputReq === 1 && !formFields[field.fieldName]) {
        missingRequired.push(field.title);
      }
    });

    if (missingRequired.length > 0) {
      setFormError(
        `Please fill in the required field(s): ${missingRequired.join(", ")}`
      );
      setShowJsonRequest(false);
    } else {
      setFormError(null);
      console.log(formFields);
      setShowJsonRequest(true);
    }
  };

  const groupedFields = formSpec.reduce(
    (acc: { [key: string]: typeof formSpec }, field) => {
      if (!acc[field.category]) acc[field.category] = [];
      acc[field.category].push(field);
      return acc;
    },
    {} as { [key: string]: typeof formSpec }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.entries(dropdownRefs.current).every(
        ([_, ref]) => ref && !ref.contains(event.target as Node)
      );
      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-white text-center">
        Form Generator
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div
            key={category}
            className="border p-4 rounded-xl shadow bg-white/15 bg-gradient-to-br from-white/30 to-white/60"
          >
            <h2 className="font-semibold text-lg mb-2 text-white">
              {category}
            </h2>
            {fields
              .sort((a, b) => a.fieldOrder - b.fieldOrder)
              .map((field) => (
                <div key={field.fieldid} className="mb-4 relative">
                  <label className="block font-large mb-1 text-white flex items-center gap-1">
                    {field.title}
                    {field.inputReq === 1 && (
                      <span className="text-red-500">*</span>
                    )}
                    {field.helpText && (
                      <span
                        className="ml-2 relative"
                        onClick={() =>
                          setShowHelpText((prev) => ({
                            ...prev,
                            [field.fieldid]: !prev[field.fieldid],
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowHelpText((prev) => ({
                              ...prev,
                              [field.fieldid]: !prev[field.fieldid],
                            }));
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Help for ${field.title}`}
                      >
                        <span className="inline-block w-4 h-4 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center cursor-pointer border border-gray-400">
                          ?
                        </span>
                        {showHelpText[field.fieldid] && (
                          <div className="absolute left-6 top-0 z-10 w-64 p-2 bg-white text-black text-xs rounded shadow-lg border border-gray-300">
                            {field.helpText}
                          </div>
                        )}
                      </span>
                    )}
                  </label>

                  {field.fieldType === "text" && (
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      onChange={(e) =>
                        handleChange(field.fieldName, e.target.value)
                      }
                    />
                  )}

                  {field.fieldType === "numberInt" && (
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      onChange={(e) =>
                        handleChange(field.fieldName, parseInt(e.target.value))
                      }
                    />
                  )}

                  {field.fieldType === "select" && (
                    <div
                      className="relative w-full"
                      ref={(el) => {
                        dropdownRefs.current[field.fieldid] = el;
                      }}
                    >
                      <button
                        type="button"
                        className="w-full p-2 pr-10 rounded-lg text-left bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-300 shadow-inner hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all relative"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === field.fieldid
                              ? null
                              : field.fieldid
                          )
                        }
                      >
                        <span className="block truncate text-gray-800">
                          {formFields[field.fieldName]
                            ? JSON.parse(field.dropVals || "{}")[
                                formFields[field.fieldName] as string
                              ]
                            : "Select an option"}
                        </span>
                        <svg
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openDropdown === field.fieldid && (
                        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
                          {Object.entries(
                            JSON.parse(field.dropVals || "{}")
                          ).map(([key, val]) => (
                            <li
                              key={key}
                              className={`px-4 py-2 text-sm text-gray-800 hover:bg-blue-100 cursor-pointer transition ${
                                formFields[field.fieldName] === key
                                  ? "bg-blue-50 font-semibold"
                                  : ""
                              }`}
                              onClick={() => {
                                handleChange(field.fieldName, key);
                                setOpenDropdown(null);
                              }}
                            >
                              {String(val)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {field.fieldType === "datetime" && (
                    <DatePicker
                      selected={
                        formFields[field.fieldName]
                          ? new Date(formFields[field.fieldName] as string)
                          : null
                      }
                      onChange={(date: Date | null) =>
                        handleChange(field.fieldName, date?.toISOString() || "")
                      }
                      showTimeSelect
                      dateFormat="yyyy-MM-dd HH:mm"
                      placeholderText="Select date & time"
                      wrapperClassName="w-full"
                      className="w-full p-2 pr-10 rounded-lg bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-300 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    />
                  )}

                  {field.fieldType === "photo" || field.requiresPhoto === 1 ? (
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 text-white"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          changePhoto(field.fieldName, e.target.files[0]);
                        }
                      }}
                    />
                  ) : null}

                  {field.commentField === 1 && (
                    <textarea
                      placeholder="Comment..."
                      className="w-full mt-2 border p-2 rounded"
                      onChange={(e) =>
                        field.commentFieldName &&
                        handleChange(field.commentFieldName, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
          </div>
        ))}
        {formError && (
          <div className="text-red-500 text-sm text-center">{formError}</div>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-500 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 border border-blue-700 transition-all duration-300 ease-in-out cursor-pointer"
          >
            Generate Server Request
          </button>
        </div>
      </form>
      {showJsonRequest && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">
            Generated Server Request (in JSON):
          </h3>
          <pre className="text-xs whitespace-pre-wrap break-words">
            {JSON.stringify(formFields, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
