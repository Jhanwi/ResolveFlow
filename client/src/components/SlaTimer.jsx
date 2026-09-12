import { useEffect, useState } from "react";

const SlaTimer = ({ dueAt, label }) => {
  const calculateTime = () => {
    const difference = new Date(dueAt) - new Date();

    if (difference <= 0) {
      return "Breached";
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 60000);

    return () => clearInterval(timer);
  }, [dueAt]);

  return (
    <div className="sla-timer">
      <span>{label}</span>
      <strong>{timeLeft}</strong>
    </div>
  );
};

export default SlaTimer;