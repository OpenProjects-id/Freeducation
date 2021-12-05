# Freeducation

Freeducation adalah website scholarship crowdfunding yang bertujuan untuk membantu orang-orang yang terkendala dalam pendidikan dari sisi finansial

[![Netlify Status](https://api.netlify.com/api/v1/badges/dbd7a9a7-b4ab-418f-a1da-f563c0595218/deploy-status)](https://freeducation.netlify.app)

# Tata Cara dan Aturan
1. Melakukan fork repositori ke akun masing-masing dan mengclone repo fork tersebut
2. Membuat branch baru di local dan push branch dengan nama yang sama ke repo fork tersebut
3. Menambahkan remote upstream di local
Menambahkan remote upstream maksudnya menambahkan remote repo utama ke repo local yang ada dikomputer supaya mudah dalam mengambil perubahan.

Jalankan perintah ini di local komputer.
```
# jika menggunakan https
git remote add upstream https://github.com/OpenProjects-id/Freeducation.git

# jika menggunakan ssh
git remote add upstream git@github.com:OpenProjects-id/Freeducation.git
```
4. Melakukan fetch dan pull ketika ada pembaruan
Jika sudah ditambahkan remote upstream, langkah ini bisa mengambil perubahan yang ada direpo utama. Biasakan mengambil pembaruan secara berkala.

```
# versi panjang
git fetch upstream main
git pull upstream main
git push

# versi singkat
git fetch upstream main && git pull upstream main && git push
```

5. Membuat issue (Opsional)
Jika mempunyai saran atau ingin menambahkan sesuatu, disarankan membuat issue ini dengan template yang sudah di sediakan. Link issue nya di pull request untuk menutup issue tersebut.

6. Membuat perubahan yang etis dan masuk akal
Tolong, jangan membuat pull request yang tidak pantas untuk di buka, misalnya membuat perubahan nama variabel atau menambah sebuah titik (.) untuk perubahannya. Hargai kami sebagai maintainer mereview setiap pull request, kita juga mengurusi pull request yang lain juga. Jika ditemukan PR seperti ini, PR TERSEBUT AKAN DICLOSE.

Jika ada pertanyaan atau saran, bukalah issue atau tanyakan ke [Discord OpenProjects.id](https://discord.gg/jXzjHu9fJ7) di channel `#freeducation`.

Terima Kasih.
