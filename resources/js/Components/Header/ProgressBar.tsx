import React from 'react';

const ProgressBarWithCaption = ({ progress, caption }) => {

    return (
        <div
            className="progress-bar"
        >
            <div
                style={{
                    width: `${progress}%`,
                    backgroundColor: '#4CAF50',
                    height: '20px',
                    transition: 'width 0.5s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
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