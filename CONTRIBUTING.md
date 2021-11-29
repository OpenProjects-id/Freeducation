# Panduan Kontribusi

## Persiapan

Untuk memulai berkontribusi pada repo ini, anda perlu membuat fork repo ini di akun github anda (lihat [panduan fork repo](https://zea.silvrback.com/cara-berkontribusi-coding-di-github)).

Setelah itu anda dapat mengikuti beberapa tahap berikut ini:

1. Mencari issue yang masih dibuka dan belum di tugaskan (assign) ke orang lain
2. Menghubungi / mention admin atau mantainer untuk mengambil issue tersebut
3. Membuat branch fitur baru di repo upstream (repo ini) jika belum ada. Misalkan branch `halaman-donasi` untuk branch fitur yang berhubungan dengan halaman donasi
4. Di repo local anda, buat branch baru dari branch fitur tersebut, nama branch disesuaikan dengan issue / subfitur yang dikerjakan. Contoh nama: `halaman-donasi/daftar-donatur`
5. Jalankan `git pull upstream halaman-donasi` pada repo fork anda untuk menerapkan perubahan di repo upstream ke repo anda
6. Anda dapat mulai mengerjakan issue / fitur

## Ketentuan Commit

Pesan commit harus memiliki format sebagai berikut:

```
<tipe>: <deksripsi>
```

### Tipe Commit

Berikut merupakan tipe-tipe pesan commit yang dapat digunakan:

| Tipe       | Deskripsi                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `feat`     | Implementasi fitur baru (cth: `feat: menambahkan halaman cart`)                                                                          |
| `fix`      | perbaikan bug / error (e.g. `fix: item in card is not showing`)                                                                          |
| `docs`     | Menambah / memperbarui dokumentasi (e.g. `docs: menambahkan file README.md`)                                                             |
| `refactor` | Refactoring kode, mengganti nama variable, menambahkan semikolon, formatting, dsb. (e.g. `refactor: mengubah nama fungsi`)               |
| `test`     | Menambahkan testing pada kode (e.g. `test: menambahkan unit test untuk addItemIntoCart()`)                                               |
| `chore`    | Menambahkan kode yang tidak berhubungan dengan semua tipe diatas. Menata kode, membuat file setup, dsb. (e.g. `chore: initiate project`) |

Setiap commit yang menyebabkan aplikasi versi sebelumnya tidak dapat berjalan dengan semestinya (lihat: [breaking changes](https://nordicapis.com/what-are-breaking-changes-and-how-do-you-avoid-them/)), harus ditambahkan `(breaking change)` pada pesan commitnya. Sebagai contoh: `refactor (breaking): memindahkan modul cart ke folder components`.

Untuk lebih jelasnya dapat dibaca lagi mengenai ketentuan commit ini di [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
