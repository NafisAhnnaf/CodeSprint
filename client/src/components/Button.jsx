const Button = ({ type = "button", label, bg = "primary", onClick }) => {
  const bgClass =
    {
      primary: "bg-blue-700 hover:bg-blue-800",
      danger: "bg-red-500 hover:bg-red-600",
      alert: "bg-yellow-600",
    }[bg] || "bg-gray-500";

  return (
    <button
      type={type}
      className={`py-2 px-3 rounded-md text-white ${bgClass}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
