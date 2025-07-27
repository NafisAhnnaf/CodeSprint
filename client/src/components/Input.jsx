// Input.jsx
const Input = ({
  type,
  label,
  name,
  placeholder,
  options = [],
  required = false,
  value,
  style,
  onChange,
}) => {
  const inputId = name || label.toLowerCase().replace(/\s+/g, "_");

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={`flex flex-col space-y-2 my-2 w-full  ${style}`}>
      <label className="text-md" htmlFor={inputId}>
        {label}
      </label>

      {type === "select" ? (
        <select
          id={inputId}
          name={inputId}
          className={`border p-2.5 rounded-md`}
          value={value}
          onChange={handleChange}
          required={required}
        >
          <option value="">-- Select an option --</option>
          {options.map((val, index) => (
            <option key={index} value={val}>
              {val}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={inputId}
          type={type}
          placeholder={placeholder}
          className={`border p-2 rounded-md`}
          value={value}
          onChange={handleChange}
          required={required}
        />
      )}
    </div>
  );
};

export default Input;
