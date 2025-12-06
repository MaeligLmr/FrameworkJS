const Input = ({ type = 'text', value, onChange, placeholder = '', className = '', ...rest }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            {...rest}
        />
    );
};

export default Input;