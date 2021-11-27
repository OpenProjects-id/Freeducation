<script>
    import { fade, slide, fly } from "svelte/transition";
    import { crowdfundings, crowdfunding } from "../stores/data.js";
    import Modal from "./Modal.svelte";
    import Loader from "./Loader.svelte";
  
    let isModalOpen = false;
  
    function calculateFunded(pledged, target) {
      return Math.round((1 / (target / pledged)) * 100);
    }
  
    function formatCurrency(nominal) {
      return nominal.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      });
    }
  
    function calculateDaysRemaining(date_end) {
      const delta = date_end - new Date();
  
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs(delta / oneDay));
    }
  
    function handleButton() {
      isModalOpen = true;
    }
  
    function handleCloseModal() {
      isModalOpen = false;
    }
  </script>
  
  <style>
    .xs-list-with-content {
      font-size: 12px;
    }
    .show {
      display: block;
      background-color: rgba(0, 0, 0, 0.45);
    }
    .pledged {
      margin-right: 2em;
    }
  </style>
  
  <!-- popularCauses section -->
  <section id="popularcause" class="bg-gray waypoint-tigger xs-section-padding">
    <div class="container">
      <div class="xs-heading row xs-mb-60">
        <div class="col-md-9 col-xl-9">
          <h2 class="xs-title">Penggalangan Dana</h2>
          <span class="xs-separetor dashed" />
          <p>Berikut adalah penggalangan dana yang sedang aktif dan berjalan di Freeducation</p>
        </div>
        <!-- .xs-heading-title END -->
      </div>
      <!-- .row end -->
      <div class="row">
        {#each $crowdfundings as crowdfunding}
          <div
            class="col-lg-4 col-md-6"
            in:slide={{ delay: 1000 }}
            out:fade={{ delay: 1000 }}>
            {#if isModalOpen === true}
              <Modal>
                <div
                  class="modal fade show"
                  id="exampleModal"
                  tabindex="-1"
                  role="dialog"
                  aria-labelledby="exampleModalLabel">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h6 class="modal-title" id="exampleModalLabel">
                        Berdonasi Untuk Pendidikan Yang Lebih Maju
                        </h6>
                        <button
                          type="button"
                          class="close"
                          data-dismiss="modal"
                          aria-label="Close"
                          on:click={handleCloseModal}>
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">
                        <form>
                          <div class="form-group">
                            <label for="exampleInputAmount">
                              Jumlah Donasi
                            </label>
                            <input
                              required
                              type="number"
                              class="form-control"
                              id="exampleInputAmount"
                              aria-describedby="amountHelp"
                              placeholder="Masukkan jumlah donasi" />
                          </div>
                          <div class="form-group">
                            <label for="exampleInputName">Nama Donatur</label>
                            <input
                              required
                              type="text"
                              class="form-control"
                              id="exampleInputName"
                              aria-describedby="nameHelp"
                              placeholder="Masukkan nama anda" />
                          </div>
                          <div class="form-group">
                            <label for="exampleInputEmail1">Alamat Email</label>
                            <input
                              required
                              type="email"
                              class="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder="Masukkan email anda" />
                          </div>
                          <div class="form-check">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              id="exampleCheck1" />
                            <label class="form-check-label" for="exampleCheck1">
                              Saya setuju dengan segala syarat dan ketentuan dari Freeducation
                            </label>
                          </div>
                        </form>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-primary">
                          Lanjut ke pembayaran
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
            {/if}
            <div class="xs-popular-item xs-box-shadow">
              <div class="xs-item-header">
  
                <img src={crowdfunding.thumbnail} alt="" />
  
                <div class="xs-skill-bar">
                  <div
                    class="xs-skill-track"
                    style="width:{calculateFunded(crowdfunding.pledged, crowdfunding.target)}%">
                    <p in:fly={{ delay: 3500, x: -100 }} style="left: 100%">
                      <span
                        class="number-percentage-count number-percentage"
                        data-value="90"
                        data-animation-duration="3500">
                        {calculateFunded(crowdfunding.pledged, crowdfunding.target)}
                      </span>
                      %
                    </p>
                  </div>
                </div>
              </div>
              <!-- .xs-item-header END -->
              <div class="xs-item-content">
                <ul class="xs-simple-tag xs-mb-20">
                  <li>
                    <a href="#">{crowdfunding.category}</a>
                  </li>
                </ul>
  
                <a href="#" class="xs-post-title xs-mb-30">{crowdfunding.title}</a>
  
                <ul class="xs-list-with-content">
                  <li class="pledged">
                    {formatCurrency(crowdfunding.target)}
                    <span>Dibutuhkan</span>
                  </li>
                  <li>
                    <span
                      class="number-percentage-count number-percentage"
                      data-value="90"
                      data-animation-duration="3500">
                      {calculateFunded(crowdfunding.pledged, crowdfunding.target)}
                    </span>
                    %
                    <span>Terdanai</span>
                  </li>
                  <li>
                    {calculateDaysRemaining(crowdfunding.date_end)}
                    <span>Hari lagi</span>
                  </li>
                </ul>
  
                <span class="xs-separetor" />
  
                <div class="row xs-margin-0">
                  <div class="xs-round-avatar">
                    <img src={crowdfunding.profile_photo} alt="" />
                  </div>
                  <div class="xs-avatar-title">
                    <a href="#">
                      <span>By</span>
                      {crowdfunding.profile_name}
                    </a>
                  </div>
                </div>
  
                <span class="xs-separetor" />
  
                <a
                  href="/donation/{crowdfunding.id}"
                  on:click={handleButton}
                  data-toggle="modal"
                  data-target="#exampleModal"
                  class="btn btn-primary btn-block">
                  Bantu Urun Dana
                </a>
              </div>
            </div>
          </div>
        {:else}
          <Loader />
        {/each}
      </div>
    </div>
  </section>
  <!-- End popularCauses section -->
  
  <!-- <div>
    <h2>Daftar crowdfunding</h2>
    {#if crowdfundings !== undefined}
      <ul>
        {#each crowdfundings as crowdfunding}
          <li>{crowdfunding.title} - {crowdfunding.category}</li>
        {/each}
      </ul>
    {:else}
      <h5>Data belum tersedia</h5>
    {/if}
  </div> -->