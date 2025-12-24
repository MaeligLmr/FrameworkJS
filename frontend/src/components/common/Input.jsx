/**
 * Input — champ de saisie réutilisable
 * Supporte les types standards et un mode spécial `file` avec libellé et aperçu.
 * 
 * Props clés :
 * - type : 'text' par défaut, 'file' pour upload
 * - value/onChange : contrôle externe (sauf mode file)
 * - label : libellé affiché au-dessus
 * - icon : icône à gauche à l'intérieur du champ
 * - button : action à droite (ex: bouton afficher/cacher)
 * - required : astérisque et attribut HTML requis
 */
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
    icon,
    button,
    ...rest
}) => {
    const reactId = useId();
    const inputId = id || name || reactId;
    const [fileLabel, setFileLabel] = useState('Aucun fichier choisi');
    const objectUrlRef = useRef(null);
    // Met à jour le libellé du fichier lorsque `fileName` change
    useEffect(() => {
        setFileLabel(fileName || 'Aucun fichier choisi');
        // nettoyage d'URL objet géré ailleurs quand on change de fichier
    }, [fileName]);

    if (type === 'file') {
        // Gestion du changement de fichier : label + URL locale pour aperçu
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
                <div className={`relative border border-gray-300 bg-white rounded-lg p-3 hover:bg-gray-50 transition ${className}`}>
                    <input
                        id={inputId}
                        name={name}
                        required={required}
                        type="file"
                        className="sr-only "
                        onChange={handleFileChange}
                        {...rest}
                    />
                    <label htmlFor={inputId} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-[#4062BB]">
                                <i className="fa fa-upload"></i>
                                {fileLabel ? (
                                    <span className="sr-only">{fileLabel}</span>
                                ) : null}
                            </div>
                            <span className="truncate text-sm text-gray-600">{fileLabel}</span>
                        </div>
                        <span className="ml-4 inline-flex items-center px-3 py-1.5 text-sm font-medium bg-[#4062BB] text-white rounded-md shadow hover:bg-[#2F4889]">Parcourir</span>
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
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    name={name}
                    required={required}
                    className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F4889] bg-white  w-full ${icon ? 'pl-10' : ''} ${button ? 'pr-12' : ''} ${className}`}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...rest}
                />
                {button && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {button}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;