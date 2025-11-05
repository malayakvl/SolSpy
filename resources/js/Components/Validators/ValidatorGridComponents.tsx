import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';
// Import the validator partial components
import ValidatorActivatedStake from '../../Pages/Validators/Partials/ValidatorActivatedStake';
import ValidatorCredits from '../../Pages/Validators/Partials/ValidatorCredits';
import ValidatorRate from '../../Pages/Validators/Partials/ValidatorRate';
import ValidatorSpyRank from '../../Pages/Validators/Partials/ValidatorSpyRank';
import ValidatorUptime from '../../Pages/Validators/Partials/ValidatorUptime';
import ValidatorGridName from '../../Pages/Validators/Partials/ValidatorGridName';
import ValidatorScore from '../../Pages/Validators/Partials/ValidatorScore';
import ValidatorSFDP from '../../Pages/Validators/Partials/ValidatorSFDP';
import ValidatorStatus from '../../Pages/Validators/Partials/ValidatorStatus';
import ValidatorJiitoScore from '../../Pages/Validators/Partials/ValidatorJiitoScore';
import ValidatorTVCScore from '../../Pages/Validators/Partials/ValidatorTVCScore';

// Shared function to render column headers
// export const renderColumnHeader = (columnName, sortClickState, setSortClickState, setCurrentPage, isLoading = false, setIsPaginationOrSorting = null) => {
//     // Map column names to sort keys
//     const columnSortKeys = {
//         "Name": "name",
//         "Status": "status",
//         "Spy Rank": "spy_rank",
//         "TVC Score": "tvc_score",
//         "TVC Rank": "tvc_rank",
//         "Vote Credits": "vote_credits",
//         "Active Stake": "active_stake",
//         "Vote Rate": "vote_rate",
//         "Inflation Commission": "inflation_commission",
//         "MEV Commission": "mev_commission",
//         "Uptime": "uptime",
//         "Client/Version": "client_version",
//         "Status SFDP": "status_sfdp",
//         "Location": "location",
//         "Awards": "awards",
//         "Website": "website",
//         "City": "city",
//         "ASN": "asn",
//         "IP": "ip",
//         "Jito Score": "jiito_score"
//     };

//     // Get sort key for this column
//     const sortKey = columnSortKeys[columnName];
    
//     // Get current sort parameters from URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const currentSortColumn = urlParams.get('sortColumn') || 'id';
//     const currentSortDirection = urlParams.get('sortDirection') || 'ASC';
    
//     // Handle sort click
//     const handleSort = (direction) => {
//         // If already loading, don't trigger another sort
//         if (isLoading) return;
        
//         // Set flag to indicate this is a sorting operation
//         if (setIsPaginationOrSorting) {
//             setIsPaginationOrSorting(true);
//         }
        
//         // Set sort click state for immediate visual feedback
//         setSortClickState({column: sortKey, direction});
        
//         // Update URL with sort parameters
//         const newUrlParams = new URLSearchParams(window.location.search);
//         newUrlParams.set('sortColumn', sortKey);
//         newUrlParams.set('sortDirection', direction);
        
//         // Update the browser URL
//         const newUrl = `${window.location.pathname}?${newUrlParams.toString()}`;
//         window.history.replaceState({}, '', newUrl);
        
//         // Reset to first page when sorting changes
//         // Update URL with new page number
//         newUrlParams.set('page', '1');
//         const newUrlWithPage = `${window.location.pathname}?${newUrlParams.toString()}`;
//         window.history.replaceState({}, '', newUrlWithPage);
        
//         // Update currentPage state
//         // This will trigger the useEffect to fetch data
//         setCurrentPage(1);
//     };

//     switch(columnName) {
//         case "Spy Rank": 
//             return (
//                 <th key="spy-rank" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Spy Rank</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'spy_rank' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'spy_rank' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'spy_rank' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'spy_rank' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Avatar": return <th key="avatar">Avatar</th>;
//         case "Name": 
//             return (
//                 <th key="name" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Name</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'name' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'name' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'name' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'name' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Status": 
//             return (
//                 <th key="status" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Status</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'status' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'status' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'status' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'status' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "TVC Score": 
//             return (
//                 <th key="tvc-score" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>TVC Score</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'tvc_score' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'tvc_score' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'tvc_score' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'tvc_score' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "TVC Rank": 
//             return (
//                 <th key="tvc-rank" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>TVC Rank</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'tvc_rank' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'tvc_rank' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'tvc_rank' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'tvc_rank' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Vote Credits": 
//             return (
//                 <th key="vote-credits" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Vote Credits</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'vote_credits' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'vote_credits' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'vote_credits' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'vote_credits' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Active Stake": 
//             return (
//                 <th key="active-stake" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Active Stake</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'active_stake' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'active_stake' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'active_stake' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'active_stake' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Vote Rate": 
//             return (
//                 <th key="vote-rate" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Vote Rate</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'vote_rate' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'vote_rate' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'vote_rate' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'vote_rate' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Jiito Score": 
//             return (
//                 <th key="jiito-score" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Jiito Score</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'jiito_score' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'jiito_score' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'jiito_score' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'jiito_score' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Inflation Commission": 
//             return (
//                 <th key="inflation-commission" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Inflation<br/>Commission</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'inflation_commission' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'inflation_commission' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'inflation_commission' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'inflation_commission' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "MEV Commission": 
//             return (
//                 <th key="mev-commission" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>MEV<br/>Commission</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'mev_commission' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'mev_commission' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'mev_commission' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'mev_commission' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Uptime": 
//             return (
//                 <th key="uptime" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Uptime</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'uptime' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'uptime' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'uptime' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'uptime' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Client/Version": 
//             return (
//                 <th key="client-version" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Client/Version</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'client_version' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'client_version' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'client_version' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'client_version' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Status SFDP": 
//             return (
//                 <th key="status-sfdp" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Status SFDP</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'status_sfdp' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'status_sfdp' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'status_sfdp' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'status_sfdp' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Location": 
//             return (
//                 <th key="location" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Location</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'location' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'location' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'location' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'location' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Awards": 
//             return (
//                 <th key="awards" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Awards</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'awards' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'awards' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'awards' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'awards' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Website": 
//             return (
//                 <th key="website" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>Website</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'website' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'website' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'website' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'website' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "City": 
//             return (
//                 <th key="city" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>City</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'city' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'city' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'city' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'city' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "ASN": 
//             return (
//                 <th key="asn" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>ASN</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'asn' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'asn' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'asn' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'asn' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "IP": 
//             return (
//                 <th key="ip" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>IP</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'ip' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'ip' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'ip' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'ip' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         case "Jito Score": 
//             return (
//                 <th key="jito-score" className="cursor-pointer">
//                     <div className="flex items-center justify-between">
//                         <span>JS</span>
//                         <div className="flex flex-col ml-2">
//                             <FontAwesomeIcon 
//                                 icon={faSortUp} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'jito_score' && currentSortDirection === 'ASC') || 
//                                     (sortClickState && sortClickState.column === 'jito_score' && sortClickState.direction === 'ASC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('ASC')}
//                             />
//                             <FontAwesomeIcon 
//                                 icon={faSortDown} 
//                                 className={`text-xs cursor-pointer hover:text-blue-500 ${
//                                     (currentSortColumn === 'jito_score' && currentSortDirection === 'DESC') || 
//                                     (sortClickState && sortClickState.column === 'jito_score' && sortClickState.direction === 'DESC') 
//                                     ? 'text-blue-500' : 'text-gray-400'
//                                 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
//                                 onClick={() => handleSort('DESC')}
//                             />
//                         </div>
//                     </div>
//                 </th>
//             );
//         default: return null;
//     }
// };

// Shared function to render column cells
export const renderBlock = (columnName, validator, epoch, settingsData, totalStakeData, validators = []) => {
    switch(columnName) {
        case "Spy Rank": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    Spy Rank:
                    <ValidatorSpyRank validator={validator} />
                </div>
            );
        case "Avatar": return (
            <div className="flex items-center justify-between text-sm py-2">
                Avatar:
                {validator.avatar_url || validator.avatar_file_url ? (
                    <img 
                        src={validator.avatar_url || validator.avatar_file_url} 
                        alt={`${validator.name} avatar`} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Create a fallback element
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500';
                            fallback.textContent = 'SP';
                            e.currentTarget.parentNode.appendChild(fallback);
                        }}
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500 font-medium">SP</span>
                    </div>
                )}
            </div>
        );
        case "Name": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    <div>Name:</div>
                    <ValidatorGridName validator={validator} />
                </div>
            );
        case "Status": return <div className="flex items-center justify-between text-sm py-1.5">Status: <ValidatorStatus validator={validator} /></div>;
        case "TVC Score": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    TVC Score:
                    <ValidatorTVCScore validator={validator} />
                </div>
            );
        case "TVC Rank": return <div className="flex items-center justify-between text-sm py-1.5">TVC Rank: <ValidatorTVCRank validator={validator} /></div>;
        case "Vote Credits": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    
                    <div>Vote Credits:</div> 
                    <ValidatorCredits validator={validator} epoch={epoch} />
                </div>
            );
        case "Active Stake": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    <div>Active Stake:</div> 
                    <ValidatorActivatedStake validator={validator} epoch={epoch} />
                </div>
            );
        case "Vote Rate": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    <div>Vote Rate:</div> 
                    <div className="flex items-center justify-end text-right">
                        <ValidatorRate validator={validator} epoch={epoch} settingsData={settingsData} totalStakeData={totalStakeData} />
                    </div>
                </div>
            );
        case "Jiito Score": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    <div>Jito Score:</div>
                    <ValidatorJiitoScore validator={validator} epoch={epoch} />
                </div>
            );
        case "Inflation Commission": return <div className="flex items-center justify-between text-sm py-1.5"><div>Inflation Commission:</div> {validator.jito_commission !== undefined ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` : 'N/A'}</div>;
        case "MEV Commission": return <div className="flex items-center justify-between text-sm py-1.5"><div>MEV Commission:</div> {validator.commission !== undefined ? `${parseFloat(validator.commission).toFixed(2)}%` : 'N/A'}</div>;
        case "Jito Score": return <div className="flex items-center justify-between text-sm py-1.5"><div>Jito Score:</div> {validator.jito_commission !== undefined ? parseFloat(validator.jito_commission).toFixed(4) : 'N/A'}</div>;
        case "Uptime": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                   <div> Uptime:</div> {validator.uptime}
                </div>
            );
        case "Client/Version": 
            // Use the latest version from validator scores if available, fallback to existing fields
            const version = validator.latestVersion || validator.version || validator.software_version || 'N/A';
            return <div className="flex items-center justify-between text-sm py-1.5"><div>Client/Version:</div> {version}</div>;
        case "Status SFDP": 
            return (
                <div className="flex items-center justify-between text-sm py-1.5">
                    <div>Status SFDP:</div>
                    <div className="flex items-center justify-end text-right">
                        <ValidatorSFDP validator={validator} epoch={epoch} />
                    </div>
                </div>
            );
        case "Location": return <div className="flex items-center justify-between text-sm py-1.5"><div>Location:</div> {validator.country || validator.ip_country || 'N/A'}</div>;
        case "Awards": return <div className="flex items-center justify-between text-sm py-1.5"><div>Awards:</div> {validator.awards || 'N/A'}</div>;
        case "Website": return <div className="flex items-center justify-between text-sm py-1.5"><div>Website:</div> {validator.url || validator.www_url || 'N/A'}</div>;
        case "City": return <div className="flex items-center justify-between text-sm py-1.5"><div>City:</div> {validator.city || validator.ip_city || 'N/A'}</div>;
        case "ASN": return <div className="flex items-center justify-between text-sm py-1.5"><div>ASN:</div> {validator.autonomous_system_number || validator.ip_asn || 'N/A'}</div>;
        case "IP": return <div className="flex items-center justify-between text-sm py-1.5"><div>IP:</div> {validator.ip || 'N/A'}</div>;
        default: return null;
    }
};

// Shared function to initialize columns configuration
export const initializeColumnsConfig = (settingsData) => {
    if (settingsData?.table_fields) {
        const parsedFields = JSON.parse(settingsData.table_fields);
        // Fix any instances of "MEV Comission" to "MEV Commission"
        return parsedFields.map(field => 
            field.name === "MEV Comission" ? {...field, name: "MEV Commission"} : field
        );
    } else {
        return [
            { name: "Spy Rank", show: true },
            { name: "Avatar", show: true },
            { name: "Name", show: true },
            { name: "Status", show: true },
            { name: "TVC Score", show: true },
            { name: "Active Stake", show: true },
            { name: "Vote Credits", show: true },
            { name: "Vote Rate", show: true },
            { name: "Inflation Commission", show: true },
            { name: "MEV Commission", show: true },
            { name: "Uptime", show: true },
            { name: "Client/Version", show: true },
            { name: "Status SFDP", show: true },
            { name: "Location", show: true },
            { name: "Awards", show: true },
            { name: "Website", show: true },
            { name: "City", show: true },
            { name: "ASN", show: true },
            { name: "IP", show: true },
            { name: "Jiito Score", show: true }
        ];
    }
};
