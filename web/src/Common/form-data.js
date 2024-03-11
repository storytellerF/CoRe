export default function objectToForm(myObject) {
    var formData = new FormData();

    // 将对象的键值对添加到 FormData 中
    for (var key in myObject) {
        if (myObject.hasOwnProperty(key)) {
            formData.append(key, myObject[key]);
        }
    }
    return formData
}