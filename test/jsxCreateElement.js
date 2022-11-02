export default function installOwnCreateElement(){
    window.React={createElement: function(tag, props, ...children){
        return {tag, props, children};
    }};
}
