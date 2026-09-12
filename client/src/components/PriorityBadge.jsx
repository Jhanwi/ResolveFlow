const PriorityBadge = ({ priority }) => {
  return (
    <span className={`badge priority-${priority}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;