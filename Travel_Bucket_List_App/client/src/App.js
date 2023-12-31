import * as React from 'react';
import { useState,useEffect } from 'react';
import ReactMapGL,{ Marker,Popup,GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import Image from 'react-bootstrap/Image';
// backend API fetch function
import {listLogEntries} from './API';

// importing the pop up new add log entry component
import LogEntryForm from './LogEntryForm';

import {getLocation} from './API';
import {deleteLogEntry} from './API';
import {likeLogEntry} from './API';

// importing the Update travel entry form component
import LogUpdateEntryForm from './LogUpdateEntryForm';

import {ToastContainer,toast} from 'react-toastify';

// Delete dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// like,delete,tripledot for update
import {Button,TextField} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';


// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass=require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

require('dotenv').config();
//console.log(process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);


const App=() => {
  const [logEntries,setLogEntries] = useState([]);
  // popup useState
  //const [showPopup, togglePopup] = React.useState(false);
  const [showPopup,setShowPopup] = useState({});

  // use state for popup add entry logs
  const [addEntryLocation,setAddEntryLocation]=useState(null);
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 1.5
  });

  const [loc,setLoc]=useState();
  const [subDivision,setsubDivision]=useState();
  const [locDescription,setlocDescription]=useState();

  // Edit Travel entry
  const [updateprocess,setUpdateProcess]=useState(false);
  const [travelentryid,setTravelEntryID]=useState();

  // Delete Travel Entry
  const [opendialog,setOpenDialog]=useState(false);
  const [deleteapikey,setDeleteAPIKEY]=useState();
  const [iddelete,setIdDelete]=useState();

  // Like Travel Entry
  const [likeupdated,setLikeUpdated] = useState();
  const [updateinitiated,setUpdateInitiated] = useState(false);

  // function to handle marker drag
  const dragEnd=async(e)=>{
    //console.log('Ended dragging the marker at');
    //console.log(e.lngLat[0]);
    // update the marker latitude longitude props via useState
    const [longitude,latitude]=e.lngLat;
    setAddEntryLocation({
      latitude,
      longitude
    });
    getLocation(latitude,longitude)
    .then(
      (data)=>{
        const locDetails={
          continent:data.continent,
          country:data.countryName,
          subdivision:data.principalSubdivision,
          locdescription:data.localityInfo
        }
        //console.log(data);
        //console.log(locDetails.locdescription.informative[1].name+','+locDetails.locdescription.informative[1].description+','+locDetails.locdescription.administrative[1].description+','+locDetails.locdescription.administrative[2].name);
        setLoc(locDetails.country);
        setsubDivision(locDetails.subdivision);
        setlocDescription(locDetails.locdescription.informative[1].name+','+locDetails.locdescription.informative[1].description+','+locDetails.locdescription.administrative[1].description+','+locDetails.locdescription.administrative[2].name);
      }
    )
    .catch(
      (err)=>{console.log(err)}
    );
  }

  // function to refresh all the map component on the map after new marker by user via form is added on the map.
  const getEntries=async()=>{
    const logEntries=await listLogEntries();
    setLogEntries(logEntries);
  };

  //console.log(logEntries);
  // useEffect function that will run only once when the Map component is Mounted
  useEffect(()=>{

    getEntries();

    // immediately invoked function expression IIFE (()=>{})() the last () are for executing the IIFE and (()=>{}) is a IIFE basic syntax
    // (async()=>{
    //   const logEntries=await listLogEntries();
    //   // set the logentries to the log entries we fetched from backend
    //   //console.log(logEntries);
    //   setLogEntries(logEntries);
    // })();
  },[])// [] is the dependacy array



 // function to handle double click to add a log entry with marker in UI by doble clicking the location on the map.
 const showAddMarkerPopup=(event)=>{
   //console.log(event);// will have a lngLat array to grab longitude latitude of the location where the user double clicked
   const [longitude,latitude]=event.lngLat;
   setAddEntryLocation({
     latitude,
     longitude
   });
   //console.log("I am inside double click handler")
   //console.log(latitude,longitude);
   //console.log('===========');
   getLocation(latitude,longitude)
   .then(
     (data)=>{
       const locDetails={
         continent:data.continent,
         country:data.countryName,
         subdivision:data.principalSubdivision,
         locdescription:data.localityInfo
       }
       //console.log(data);
       //console.log(locDetails.locdescription.informative[1].name+','+locDetails.locdescription.informative[1].description+','+locDetails.locdescription.administrative[1].description+','+locDetails.locdescription.administrative[2].name);
       setLoc(locDetails.country);
       setsubDivision(locDetails.subdivision);
       setlocDescription(locDetails.locdescription.informative[1].name+','+locDetails.locdescription.informative[1].description+','+locDetails.locdescription.administrative[1].description+','+locDetails.locdescription.administrative[2].name);
     }
   )
   .catch(
     (err)=>{console.log(err)}
   );

 }

 // ===================== Version 1.3.0 ============================
 // ==================UNDER CONSTRUCTION ===========================
 const showUpdateMarkerPopup=(e,travelEntryToUpdate)=>{
   setUpdateProcess(true);
   setTravelEntryID(travelEntryToUpdate);

 }

 const showDeleteDialog=(e,entryIdToDelete)=>{
   console.log(entryIdToDelete);
   setIdDelete(entryIdToDelete);
   setOpenDialog(true);
 }
 const handleDeleteButton = e => {
   setDeleteAPIKEY(e.target.value);
 }

 const handleClose = () => {
    setOpenDialog(false);
  };

 const handleDelete = async() => {

   if(!iddelete){
     toast.error('🤷‍♀️ Something went wrong!!');
   }
   if(!deleteapikey){
     toast.error('🐱‍🚀 API KEY is needed to perform delete operation!!');
     return;
   }
   if(deleteapikey.length<=6){
     toast.error('🐱‍🚀 API KEY should be more than 6 characters long!!');
     return;
   }
   // grab the entry id and api key from user
   const deleteEntry={
     tblapikey:deleteapikey,
     deleteid: iddelete
   }

   await deleteLogEntry(deleteEntry);

   toast.info('🐱‍👤 Processing...');
   setOpenDialog(false);

   setTimeout(()=>{window.location.reload();},3000);
   // at the end when everyting goes right


 }

 const likeHandler = async (e,likeid) => {

   setUpdateInitiated(true);
   const result = await likeLogEntry(likeid);
   setLikeUpdated(result.updatedData.likeCount);
   toast.info('🎈 Travel-Location Liked!!');
   return;
 }




  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {updateprocess?<LogUpdateEntryForm travelentryid={travelentryid} />:
      <ReactMapGL
      {...viewport}
      mapStyle="mapbox://styles/alpacinoj/ckobddu730zzo17o2nejdttvs"
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      onViewportChange={nextViewport => setViewport(nextViewport)}
      onDblClick={showAddMarkerPopup}
      >

       {
         logEntries.map(entry=>(
           <React.Fragment key={entry._id}>
           <Marker
            latitude={entry.latitude}
            longitude={entry.longitude}
            >
            <div onClick={()=>setShowPopup(
              { // commented the spreading out for each click pop up so that only 1 pop up appears at a time.
                //...showPopup,
              [entry._id]:true}
            )}>

              <svg
              className="marker"
              style={{
                width:`${6*viewport.zoom}`,
                height:`${6*viewport.zoom}`
              }}
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

           </Marker>
           {
             showPopup[entry._id] ? (
             <Popup
               latitude={entry.latitude}
               longitude={entry.longitude}
               closeButton={true}
               closeOnClick={false}
               dynamicPosition={true}
               onClose={()=>setShowPopup({})}
                  // commented this line so that only one pop up appears at a time on map
                 //{...showPopup,[entry._id]:false}

               anchor="top"
               sortByDepth={true} >
               <div className="popupmarked">
                 {entry.image ? <Image src={entry.image} alt={entry.title} rounded /> : <Skeleton variant="rect" width={210} height={118} />}
                 <hr />
                 <small className="utilsIcons">
                   <Button
                    type= "submit"
                    style={{color:'green'}}
                    size="small"
                    onClick={e=>showUpdateMarkerPopup(e,entry)}
                    >
                    <MoreHorizIcon fontSize="default" />
                   </Button>
                   <Button
                      style={{color:'blue'}}
                      size="small"
                      onClick={e=>likeHandler(e,entry._id)}>

                    <ThumbUpAltIcon fontSize="small" />
                     {updateinitiated?likeupdated:entry.likeCount} Like
                   </Button>
                   <Button
                      style={{color:'red'}}
                      size="small"
                      onClick={e=>showDeleteDialog(e,entry._id)}
                   >
                    <DeleteIcon fontSize="small" />
                      Delete
                   </Button>
                   <Dialog open={opendialog} onClose={handleClose} aria-labelledby="form-dialog-title">
                      <DialogTitle id="form-dialog-title">Confirm</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Confirm deleting this travel-entry by providing TBL API-KEY.
                        </DialogContentText>
                        <TextField
                          autoFocus
                          margin="dense"
                          id="name"
                          label="API KEY"
                          type="password"
                          fullWidth
                          onChange={handleDeleteButton}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose} color="secondary">
                          Cancel
                        </Button>
                        <Button onClick={handleDelete} style={{color:'red'}}>
                          <DeleteIcon fontSize="small" />
                            Delete
                        </Button>
                      </DialogActions>
                  </Dialog>
                 </small>
                 <hr />
                 <h3>🎯Location Description: </h3><p>{entry.description}</p>
                 <small><b>Visited On: {new Date(entry.visitDate).toLocaleDateString()}</b></small>
                 <hr/>
                 <h5>🧳 Comments: </h5><p>  {entry.comments} </p>
                 <hr />
                 <h5>🏷️ Tag: {entry.title} </h5>
                 <h5>😍 Rating: {entry.rating==='NaN'?'Not Rated 😶':entry.rating}</h5>
                 <hr />
                 <small className="devmes"><b>Emoji Cipher:
                     ✌️ + 🖱️ + 🗺️ + ✍️ = ❌  </b></small>
               </div>
             </Popup>
           ):null
         }
         </React.Fragment>
       ))
     }

     {/*to show  a marker with pop up form for new log entry when use double clicks on location on map.*/}
     {
       addEntryLocation ? (
         <>
         <Marker
          latitude={addEntryLocation.latitude}
          longitude={addEntryLocation.longitude}
          draggable={true}
          onDragEnd={dragEnd}
          >
          <div>

            <svg
            className="notvismark"
            style={{
              width:`${6*viewport.zoom}`,
              height:`${6*viewport.zoom}`
            }}
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

         </Marker>
          <Popup
          latitude={addEntryLocation.latitude}
          longitude={addEntryLocation.longitude}
          closeButton={true}
          closeOnClick={false}
          dynamicPosition={true}
          onClose={()=>setAddEntryLocation(null)}
          anchor="top"
          tipSize={5} >
           <div className="popup">
             <h3> New Log ✏️ 📑</h3>
             <LogEntryForm
              onClose={()=>{
               setAddEntryLocation(null);
               getEntries();
             }}
              location={addEntryLocation}
              locCountry={loc}
              locDivision={subDivision}
              locDescription={locDescription}/>
           </div>
         </Popup>
         </>
       ):null
     }
     <GeolocateControl
          style={{position:'absolute',right:10,top:10}}
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
          label='Locate Me On the Map'
          fitBoundsOptions={{maxZoom:2}}
          auto
        />
      </ReactMapGL>
    }
    </>

  );
}

export default App;
