import { useEffect } from 'react';
import { useId, useRef, useState } from 'react';
const Input = ({
    type = 'text',
    value,
    onChange,
    placeholder = '',
    className = '',
    label,
    id,
    name,
    required,
    fileName,
    ...rest
}) => {
    const reactId = useId();
    const inputId = id || name || reactId;
    const [fileLabel, setFileLabel] = useState('Aucun fichier choisi');
    const objectUrlRef = useRef(null);
    useEffect(() => async () => {
        setFileLabel(fileName || 'Aucun fichier choisi');
    }, [fileName]);

    if (type === 'file') {
        const handleFileChange = (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                setFileLabel(files.length === 1 ? files[0].name : `${files.length} fichiers sélectionnés`);
                // Generate local preview for first file
                if (files[0]) {
                    if (objectUrlRef.current) {
                        URL.revokeObjectURL(objectUrlRef.current);
                        objectUrlRef.current = null;
                    }
                    const url = URL.createObjectURL(files[0]);
                    objectUrlRef.current = url;
                }
            } else {
                setFileLabel('Aucun fichier choisi');
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                }
            }
            if (typeof onChange === 'function') onChange(e);
        };
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required ? <span className="text-red-500">*</span> : ''}
                    </label>
                )}
                <div className={`relative border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition ${className}`}>
                    <input
                        id={inputId}
                        name={name}
                        required={required}
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        {...rest}
                    />
                    <label htmlFor={inputId} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600">
                                <i className="fa fa-upload"></i>
                                {fileLabel ? (
                                    <span className="sr-only">{fileLabel}</span>
                                ) : null}
                            </div>
                            <span className="truncate text-sm text-gray-600">{fileLabel}</span>
                        </div>
                        <span className="ml-4 inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">Parcourir</span>
                    </label>
                </div>
                {placeholder && (
                    <p className="mt-1 text-xs text-gray-500">{placeholder}</p>
                )}
            </div>
        );
    }
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required ? <span className="text-red-500">*</span> : ''}
                </label>
            )}
            <input
                id={inputId}
                name={name}
                required={required}
                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className} w-full`}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...rest}
            />
        </div>
    );
};

export default Input;