const StatusBadge = ({ status }) => {
  return (
    <span className={`badge status-${status}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;