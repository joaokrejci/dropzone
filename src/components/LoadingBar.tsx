import "./LoadingBar.css"

interface LoadingBarProps {
  percentage: number;
}

const LoadingBar = function ({ percentage }: LoadingBarProps) {
  const loadingBlockStyle = {
    display: "inline-block",
    width: `${percentage}%`,
  };

  return (
    <div className="LoadingBar">
      <div className="outter-percentage">
        <span className="inner-percentage" style={loadingBlockStyle}></span>
      </div>
      <span>{percentage | 0} %</span>
    </div>
  );
};

export default LoadingBar;
