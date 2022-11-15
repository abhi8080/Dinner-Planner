export default function Show(props) {
    const [hash, setHash] = React.useState(window.location.hash);

    function hashHasChangedACB() {
        setHash(window.location.hash);
    }

    function wasDeletedACB(){
        window.removeEventListener("hashchange", hashHasChangedACB)
    }

    function wasCreatedACB(){  
        window.addEventListener("hashchange", hashHasChangedACB);
        return wasDeletedACB;
    }

    React.useEffect(wasCreatedACB, []);

    return (
        <div class={(hash!==props.hash)&&"hidden"}>
            {props.children}
        </div>
    );
}