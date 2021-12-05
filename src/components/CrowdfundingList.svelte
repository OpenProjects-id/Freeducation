<script>
    import { fade,fly,slide } from "svelte/transition";
    import { crowdfundings } from "../stores/data.js";
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
            <div class="xs-popular-item xs-box-shadow">
              <div class="xs-item-header">
  
                <img src={crowdfunding.thumbnail} alt="" style="height: 250px; width: 350px;"/>
  
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
                    <a href="/donation/{crowdfunding.id}">{crowdfunding.category}</a>
                  </li>
                </ul>
  
                <a href="/donation/{crowdfunding.id}" class="xs-post-title xs-mb-30">{crowdfunding.title}</a>
  
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
                    <a href="/donation/{crowdfunding.id}">
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
  