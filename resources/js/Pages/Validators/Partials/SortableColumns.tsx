import React, { useEffect, useState } from 'react';

    const draggableList = [
        {
            name: "Mike"
        },
        {
            name: "Michael"
        },
        {
            name: "Mason"
        },
        {
            name: "Miller"
        },
        {
            name: "Milner"
        },
        {
            name: "Merry"
        }
    ];

export default function Index() {
    const [list, setList] = useState([
        {
            name: "Mike"
        },
        {
            name: "Michael"
        },
        {
            name: "Mason"
        },
        {
            name: "Miller"
        },
        {
            name: "Milner"
        },
        {
            name: "Merry"
        }
    ]);

    return (
        <>
            <h1>
                Very Simple Draggable Stuff <>⚛️</>
            </h1>
            {/* <ReactSortable
                filter=".addImageButtonContainer"
                dragClass="sortableDrag"
                list={list}
                setList={setList}
                animation="200"
                easing="ease-out"
            >
                {list.map(item => (
                <div className="draggableItem">{item.name}</div>
                ))}
            </ReactSortable> */}
        </>
    );
}
