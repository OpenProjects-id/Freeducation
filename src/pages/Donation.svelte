<script>
  import { crowdfunding, getCrowdfunding } from "../stores/data.js";
  import { params } from "../stores/pages.js";
  import router from "page";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import Loader from "../components/Loader.svelte";

  let amount,
    name,
    email,
    agree = false,
    donation,
    contribute = 0;

  $: if ($crowdfunding) {
    contribute = Math.floor((parseInt(amount) / $crowdfunding.target) * 100);
  }

  getCrowdfunding($params.id);

  function handleButtonClick() {
    console.log("Button click");
  }

  async function handleForm(event) {
    agree = false;
    const newData = await getCrowdfunding($params.id);
    newData.pledged = newData.pledged + parseInt(amount);
    try {
      const res = await fetch(
        `https://freeducation-api.herokuapp.com/crowdfundings/${$params.id}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(newData),
        }
      );
      console.log(res);
      router.redirect('/success');
      // const resMid = await fetch(`/.netlify/functions/payment`, {
      //   method: "POST",
      //   headers: {
      //     "content-type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     id: $params.id,
      //     amount: parseInt(amount),
      //     name,
      //     email,
      //     donation,
      //   }),
      // });
      // const midtransData = await resMid.json();
      // console.log(midtransData);
      // window.location.href = midtransData.url;
    } catch (err) {
      console.log(err);
    }
  }
</script>

<Header />
{#if !$crowdfunding}
  <Loader />
{:else}
  <section
    class="xs-banner-inner-section parallax-window"
    style="background-image:url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80')"
  >
    <div class="container">
      <div class="color-white xs-inner-banner-content">
        <h2>Berdonasi</h2>
        <p>{$crowdfunding.title}</p>
      </div>
    </div>
  </section>
  <!--breadcumb end here-->
  <!-- End welcome section -->
  <main class="xs-main">
    <!-- donation form section -->
    <section class="xs-section-padding bg-gray">
      <div class="container">
        <div class="row">
          <div class="col-lg-6">
            <div class="xs-donation-form-images">
              <img src={$crowdfunding.thumbnail} class="img-responsive" alt="Family Images" style="border-radius: 25px;" />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="xs-donation-form-wraper">
              <div class="xs-heading xs-mb-30">
                <h2 class="xs-title">{$crowdfunding.title}</h2>
                <p class="small">
                  Meskipun kami hadir sebagai organisasi non-profit, namun tidak bisa dipungkiri bahwa biaya server, domain, pemeliharaan, dll harus tetap jalan. Kamu bisa berdonasi buat kami agar tetap bisa menyalakan layanan platform
                  Freeducation ini untuk menolong saudara-saudara kita.
                </p>
                <h5>
                  Donasi kami akan berkontribusi sebesar
                  <strong>{contribute}%</strong>
                  dari total donasi yang ada.
                </h5>
                <span class="xs-separetor v2" />
              </div>
              <!-- .xs-heading end -->
              <form on:submit|preventDefault={handleForm} action="#" method="post" id="xs-donation-form" class="xs-donation-form" name="xs-donation-form">
                <div class="xs-input-group">
                  <label for="xs-donate-name">
                    Jumlah Donasi
                    <span class="color-light-red">**</span>
                  </label>
                  <input type="text" name="amount" id="xs-donate-amount" class="form-control" bind:value={amount} required="true" placeholder="Rp. " />
                </div>
                <!-- .xs-input-group END -->
                <div class="xs-input-group">
                  <label for="xs-donate-name">
                    Nama Anda
                    <span class="color-light-red">**</span>
                  </label>
                  <input type="text" name="name" id="xs-donate-name" class="form-control" bind:value={name} required="true" placeholder="Masukkan Nama Anda" />
                </div>
                <div class="xs-input-group">
                  <label for="xs-donate-email">
                    Email Anda
                    <span class="color-light-red">**</span>
                  </label>
                  <input type="email" name="email" required="true" id="xs-donate-email" class="form-control" bind:value={email} placeholder="Masukkan Email Anda" />
                </div>
                <div class="xs-input-group">
                  <label for="xs-donate-name">
                    Nama Proyek Urun Dana
                    <span class="color-light-red">**</span>
                  </label>
                  <input type="text" name="donation_name" id="xs-donate-name" class="form-control" bind:value={donation} required="true" placeholder="Masukkan Nama Proyek Urun Dana" />
                  <p class="small">
                    **CATATAN: Mohon masukkan nama proyek urun dana sesuai dengan yang ingin Anda donasikan. Ini untuk mempermudah kami dalam pencatatan dan juga penyaluran dana yang sudah terkumpul kepada penggalang dana.
                  </p>
                </div>
                <div class="xs-input-group" id="xs-input-checkbox">
                  <input type="checkbox" name="agree" id="xs-donate-agree" bind:checked={agree}/>
                  <label for="xs-donate-agree">
                    Saya setuju dengan Syarat dan Ketentuan dari Freeducation
                    <span class="color-light-red">**</span>
                  </label>
                </div>
                <!-- .xs-input-group END -->
                <button type="submit" disabled={!agree} class="btn btn-primary text-white" style="background-color: #012C6D;">
                  <span class="badge">
                    <i class="fa fa-heart" />
                  </span>
                  Berdonasi Sekarang
                </button>
              </form>
              <!-- .xs-donation-form #xs-donation-form END -->
            </div>
          </div>
        </div>
        <!-- .row end -->
      </div>
      <!-- .container end -->
    </section>
    <!-- End donation form section -->
  </main>
{/if}

<Footer />

<style>
  #xs-input-checkbox {
    display: flex;
    align-items: center;
  }
  #xs-donate-agree {
    width: 35px;
  }
  label[for="xs-donate-agree"] {
    margin: 0;
    margin-left: 10px;
  }
  .xs-donation-form-images {
    text-align: center;
  }
</style>
