<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import Map from "../components/Map.svelte";

  export let ready;
</script>

<svelte:head>
  <script
    defer
    async
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCy7becgYuLwns3uumNm6WdBYkBpLfy44k&callback=initMap">
  </script>
</svelte:head>

<Header />
<!-- welcome section -->
<!--breadcumb start here-->
<section class="xs-banner-inner-section parallax-window" style="background-image:url('assets/images/contact_bg.png')">
	<div class="container">
		<div class="color-white xs-inner-banner-content">
			<h2>Kontak</h2>
			<p>Butuh bantuan? Hubungi kami</p>
		</div>
	</div>
</section>

<main class="xs-main">
  <!-- contact section -->
  <section class="xs-contact-section-v2">
    <div class="container">
      <div class="xs-contact-container">
        <div class="row">
          <div class="col-lg-6">
            <div class="xs-contact-form-wraper">
              <h4>Kirimkan kami pesan</h4>
              <form action="#" method="POST" id="xs-contact-form" class="xs-contact-form contact-form-v2">
                <div class="input-group">
                  <input type="text" name="name" id="xs-name" class="form-control" placeholder="Enter Your Name....." />
                  <div class="input-group-append">
                    <div class="input-group-text"><i class="fa fa-user" /></div>
                  </div>
                </div>
                <!-- .input-group END -->
                <div class="input-group">
                  <input type="email" name="email" id="xs-email" class="form-control" placeholder="Enter Your Email....." />
                  <div class="input-group-append">
                    <div class="input-group-text"><i class="fas fa-envelope" /></div>
                  </div>
                </div>
                <!-- .input-group END -->
                <div class="input-group massage-group">
                  <textarea name="massage" placeholder="Enter Your Message....." id="xs-massage" class="form-control" cols="30" rows="10" />
                  <div class="input-group-append">
                    <div class="input-group-text"><i class="fa fa-pencil" /></div>
                  </div>
                </div>
                <!-- .input-group END -->
                <button class="btn btn-success" type="submit" id="xs-submit">Kirim</button>
              </form>
              <!-- .xs-contact-form #xs-contact-form END -->
            </div>
            <!-- .xs-contact-form-wraper END -->
          </div>
          <div class="col-lg-6">
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3966.6591430492995!2d106.7892984!3d-6.1763647!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f65f9ccbfb47%3A0x94f1dfd1fc19abb8!2sJl.%20Letjen%20S.%20Parman%20No.28%2C%20RT.12%2FRW.6%2C%20Tj.%20Duren%20Sel.%2C%20Kec.%20Grogol%20petamburan%2C%20Kota%20Jakarta%20Barat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2011470!5e0!3m2!1sid!2sid!4v1638122679679!5m2!1sid!2sid" width="500" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </section>
</main>
<Footer />