import React from 'react';

const ProgressBarWithCaption = ({ progress, caption }) => {

    return (
        <div
            className="progress-bar"
        >
            <div
                style={{
                    width: `${progress}%`,
                    backgroundColor: '#d2cdcd',
                    opacity: 0.3,
                    height: '44px',
                    transition: 'width 0.5s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginTop: '1px',
                    fontSize: '12px',
                }}
            >
            </div>
            {caption && <div className="progress-bar-caption">{caption}</div>}
        </div>
    );
};

export default ProgressBarWithCaption;