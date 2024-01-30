import { supabase } from '@/supabase';
import { loading, file, errorMessage, caption } from './UploadPhotoModal.vue';

export const handleOk = async () => {
loading.value = true;
const fileName = Math.floor(Math.random() * 1000000000000);
if (file.value) {
const { data, error } = await supabase.storage.from("images").upload('public/' + fileName, file.value);

if (error) {
loading.value = false;
return errorMessage.value = "Unable to upload image";
}

await supabase.from('posts').insert({
url: data.path,
caption: caption.value,
owner_id: user.value.id
});
}

loading.value = false;
};
