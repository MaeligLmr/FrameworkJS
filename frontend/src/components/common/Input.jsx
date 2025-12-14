import { useId } from 'react';
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
    ...rest
}) => {
    const reactId = useId();
    const inputId = id || name || reactId;
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
                className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className} w-full`}
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