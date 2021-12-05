<script>
    import { onDestroy } from "svelte";
    import CrowdfundingList from '../components/CrowdfundingList.svelte';
    import Header from '../components/Header.svelte';
    import Welcome from '../components/Welcome.svelte';
    import Promo from '../components/Promo.svelte';
    import Footer from '../components/Footer.svelte';

    onDestroy(function () {
        window.scrollTo(0, 0);
    });
</script>

<Header />
<Welcome />
<CrowdfundingList />
<Promo />
<Footer />