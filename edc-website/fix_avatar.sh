#!/bin/bash
sed -i '' -e 's/const base64String = reader.result as string/const file = e.target.files?.[0]; if (!file) return;/' \
    -e 's/setAvatarUrl(base64String)/const { getSupabase } = require("@\/lib\/supabase\/client"); const supabase = getSupabase(); const fileName = `${Date.now()}_${file.name}`; await supabase.storage.from("avatars").upload(fileName, file); const { data } = supabase.storage.from("avatars").getPublicUrl(fileName); setAvatarUrl(data.publicUrl); await updateMyProfile({ avatarUrl: data.publicUrl });/' \
    src/app/\(app\)/profile/page.tsx
