import React from 'react';
import ValidatorName from '../../Pages/Validators/Partials/ValidatorName';
import ValidatorUptime from '../../Pages/Validators/Partials/ValidatorUptime';
import ValidatorSFDP from '../../Pages/Validators/Partials/ValidatorSFDP';
import ValidatorSpyRank from '../../Pages/Validators/Partials/ValidatorSpyRank';
import ValidatorScore from '../../Pages/Validators/Partials/ValidatorScore';
import ValidatorRate from '../../Pages/Validators/Partials/ValidatorRate';
import ValidatorCredits from '../../Pages/Validators/Partials/ValidatorCredits';
import ValidatorActivatedStake from '../../Pages/Validators/Partials/ValidatorActivatedStake';

interface ValidatorGridCardProps {
    validator: any;
    epoch: number | undefined;
    settingsData: any;
    totalStakeData: any;
    isSelected: boolean;
    onCheckboxChange: (id: string | number) => void;
    columnsConfig: any[];
}

export default function ValidatorGridCard({ 
    validator, 
    epoch, 
    settingsData, 
    totalStakeData, 
    isSelected, 
    onCheckboxChange,
    columnsConfig
}: ValidatorGridCardProps) {
    // Helper function to render cell content based on column name
    const renderColumnContent = (columnName: string) => {
        switch (columnName) {
            case "Spy Rank":
                return <ValidatorSpyRank validator={validator} />;
            case "Name":
                return <ValidatorName validator={validator} />;
            case "Avatar":
                return (
                    <img 
                      src={validator.avatar_url || validator.avatar_file_url} 
                      alt={`${validator.name} avatar`} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                );
            case "Status":
                return (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        validator.delinquent 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                    }`}
                    >
                        {validator.delinquent ? 'Delinquent' : 'Active'}
                    </span>
                );
            case "TVC Score":
                return <ValidatorScore validator={validator} epoch={epoch} />;
            case "Active Stake":
                return <ValidatorActivatedStake validator={validator} epoch={epoch} />;
            case "Vote Credits":
                return <ValidatorCredits validator={validator} epoch={epoch} />;
            case "Vote Rate":
                return (
                    <ValidatorRate
                      validator={validator}
                      epoch={epoch}
                      settingsData={settingsData}
                      totalStakeData={totalStakeData}
                    />
                );
            case "Inflation Commission":
                return validator.commission !== undefined 
                    ? `${(parseFloat(validator.commission) / 100).toFixed(2)}%` 
                    : 'N/A';
            case "MEV Commission":
                return validator.jito_commission !== undefined 
                    ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` 
                    : 'N/A';
            case "Uptime":
                return <ValidatorUptime validator={validator} epoch={epoch} />;
            case "Client/Version":
                return (
                    <span className="bg-[#703ea2] text-white px-2 py-1 rounded-lg text-xs">
                        {validator.version || validator.software_version || 'N/A'}
                    </span>
                );
            case "Status SFDP":
                return <ValidatorSFDP validator={validator} epoch={epoch} type={'card'} />;
            case "Location":
                return validator.country || 'N/A';
            case "Awards":
                return validator.awards || '0';
            case "Website":
                return validator.www_url ? (
                    <a 
                      href={validator.www_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                        Link
                    </a>
                ) : 'N/A';
            case "City":
                return validator.city || 'N/A';
            case "ASN":
                return validator.asn || validator.autonomous_system_number || 'N/A';
            case "IP":
                return validator.ip || 'N/A';
            case "Jiito Score":
                if (validator.jito_score === undefined || validator.jito_score === null) {
                    return 'N/A';
                }
                const numericScore = typeof validator.jito_score === 'string'
                    ? parseFloat(validator.jito_score)
                    : validator.jito_score;
                return Number.isFinite(numericScore) ? numericScore.toFixed(2) : 'N/A';
            default:
                return 'N/A';
        }
    };

    return (
        <div
          className={`flex flex-col border rounded-lg shadow-sm overflow-hidden ${
            isSelected ? 'ring-2 ring-blue-500' : 'bg-white'
        }`}
        >
            {/* Selection Header */}
            <div className="flex items-center p-3 bg-gray-50 border-b">
                <input 
                  type="checkbox" 
                  id={`card-${validator.id}`} 
                  checked={isSelected}
                  onChange={() => onCheckboxChange(validator.id)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={`card-${validator.id}`} className="text-sm font-medium text-gray-700">
                    Select
                </label>
            </div>
            
            {/* Card Content */}
            <div className="p-4 flex-grow">
                {/* Grid of all visible columns */}
                <div className="grid grid-cols-1 gap-3">
                    {columnsConfig
                        .filter(column => column.show)
                        .map((column, index) => (
                            <div key={index} className="flex items-start">
                                <div className="w-1/3 text-sm font-medium text-gray-500 pr-2">
                                    {column.name}:
                                </div>
                                <div className="w-2/3 text-sm text-gray-900">
                                    {renderColumnContent(column.name)}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}