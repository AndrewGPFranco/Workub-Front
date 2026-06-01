<template>
  <div id="page-top" class="demands-page">
    <header class="site-header">
      <nav class="navbar" :aria-label="t('demands.mainNav')">
        <RouterLink :to="{name: 'Demands'}" class="brand" aria-label="Workhub">
          <img src="/favicon.png" alt="" class="brand-logo">
          <span class="brand-copy">Work<span>hub</span></span>
        </RouterLink>

        <div class="navbar-center">
          <a class="nav-link active" href="#demands-list"><i class="pi pi-inbox"/><span>{{
              t('demands.nav')
            }}</span></a>
          <span class="nav-link muted" :title="t('demands.reviewSoon')"><i
              class="pi pi-bookmark"/><span>{{ t('demands.review') }}</span></span>
        </div>

        <div class="navbar-actions">
          <Button icon="pi pi-search" text rounded disabled :aria-label="t('demands.searchSoon')"/>
          <LanguageSelect/>
          <ThemeToggle/>
          <span class="navbar-divider"/>
          <div class="profile-copy">
            <strong>{{ userName }}</strong>
            <span>{{ authStore.userLogged?.email }}</span>
          </div>
          <div class="avatar">{{ userInitials }}</div>
          <Button icon="pi pi-sign-out" text rounded :aria-label="t('demands.logout')" @click="logout"/>
        </div>
      </nav>
    </header>

    <main class="workspace">
      <header class="desk-header">
        <div>
          <p class="edition">{{ t('demands.personalPanel') }} <span>/</span> {{ todayLabel }}</p>
          <h1>{{ t('demands.heading') }}<br><em>{{ t('demands.headingEmphasis') }}</em></h1>
        </div>
        <div class="header-aside">
          <p>{{ t('demands.intro') }}</p>
          <Button :label="t('demands.register')" icon="pi pi-plus" class="new-demand-button" @click="focusForm"/>
        </div>
      </header>

      <section class="pulse" :aria-label="t('demands.currentSlice')">
        <div class="pulse-label">
          <span class="live-dot"/>
          <strong>{{ t('demands.currentSlice') }}</strong>
        </div>
        <dl>
          <div>
            <dt>{{ t('demands.items') }}</dt>
            <dd>{{ demandStore.demands.length }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.ongoing') }}</dt>
            <dd>{{ ongoingCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.urgent') }}</dt>
            <dd>{{ urgentCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.overdue') }}</dt>
            <dd>{{ overdueCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.closed') }}</dt>
            <dd>{{ doneCount }}</dd>
          </div>
        </dl>
      </section>

      <section class="content-grid">
        <section id="demands-list" class="list-board">
          <div class="section-heading list-heading">
            <div>
              <p class="kicker">{{ t('demands.queue') }}</p>
              <h2>{{ t('demands.onTable') }}</h2>
            </div>
            <div class="list-heading-actions">
              <Select
                  v-model="selectedStatusFilter"
                  :options="statusFilterOptions"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('demands.filterByStatus')"
                  :aria-label="t('demands.filterByStatus')"
                  class="status-filter"
                  @change="applyFilters"


              ct
     el="selectedPriority
          tyFilte
              option-label="label"
     n-value="value"
                 demands.filterByPriority')"
                 ('
            rByPri

          ass= status-filter"
                  @change="applyFi
                    />
              <Button
      icon="pi pi-refresh"


          unde
                  :aria-label="t('demands.r fresh')"
           ng="demand tore.isLoading"
                  @ mands(demandStore.currentPage)"
              />
            </di
           </d v>

          <div v-if="de
            oading"  e">
            <i class="pi pi-spin pi-spinne
                     <span>{{ t('dema /span>
          </

                     div v-else-if ands.length  ty-state">
            <strong>{{ t('demands.emptyTitle') }}
                          <span>{{ t('demands.emptyDesc n>
          </div>

          <div v-else clas
                                 <article
                v-for="(demand, ind
                              :key="demand.id"
                class="demand-item"

              ="bu ton"

                             :aria-label="`${tls')}: ${demand.tit e}`"
                     k="op nDemandDetails(demand)"
                @keydown.enter.self="openDemandDetails(demand)"
                @keydown.space.self.prevent="openDemandDetails(deman


                ass=" emand-index">{{ St ing(in
                (2  '0') }}</span>
              <div class="demand-main">
                  iv class="demand-title-row">
    {{ demand.title }}</h3>
          lass
                ', ` riority-${demand.pri}`]">
                    {{ priorityLabels[demand.priority] }}

                            </div>
                <p>{{ demand.description }}</p>
      ="dema
              ToRevi
              ew-n te">
                  <i class="pi pi-bookma k-fill"/>
                  {{ demand.observationsToReview }}
                </p>
                <div class="demand-meta">

                i pi-ca endar"/>{{ formatDe dlin (demand deadline) }}</span>
             pi-clock"/>{{ formatDate(demand.cre


                              </div>
  ss="
                            status-stamp', `s .toLowerCase()}`]">
              demand.status] }}
                </s

              "pi pi
             rounded :
          "t('de
          "
                        @click.stop="startEditing(demand)"/>
                <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    :aria-label="t('demands.delete')"
                    @click.stop="confirmDeletion(demand)"
                /
               </div>
                  cle>
          </div>

 lass
                          <span>
              {{ t('dema mandStore.currentPage + 1 }}
              <template v-if="demandS { t('demands.of') }} {{ demandStore.totalPages }}

              emandSt } {{ t('demands.items')
                      an>

                                   <Button
               ow-left"
                  text
                  :aria-label= sPage')"
                  :disabled="demandStore=
            ore.is

        lick="load
        mandSt re.currentPage - 1)"

                     <Button
         =" i pi-arrow-right"
                              text
                   a ia-label="t('demands.n xtPage
                     :disabled="!d m ndStore.canGoForw r  || demandStore. sLoadin
                  mands(demandSto e currentPage + 1)"
              />
            </div>

     n>


           ref= formCard" class="in ake">
          <div class="i">
     s="kicker">{{ editingDemandId ? t('de
            r') : t('d mands.newKicker') }}</p>
            <h2>{{ editingDemandId ? t('deman s.edit') : t('de
          }</h2>
  {{
     tingDemandId ? t('demands.editDescription') ewDescrip
                }}</p>
          </div>

     demand-form" @submit.prevent="saveDemand">

                       .title')
                   od .title"  t('dema older')" required fluid/>
            </label>

            <label>
              <sp s.descrip
                          <Textarea
                  .description"
                  :placeholder="t(' Placehol

             quired
     flui
             />
            </label>

            <l
                 <span {{ t('demands.reviewNot ') }} <smal >{{ t('
          nal') }}
            >
              <Texta
                      m.observationToReview"
                t('dema ds.reviewNotePlacehol er')"
                   ows="4"
                  fluid
              />
 abel>

  el>
    {{ t('demands.deadline') }}</span>
      xt v-mo ype="date" fluid/>


                       <div class="form-
              label>
              s.status') }}</span>
              ect vus tusOptiobel="l
            alue="v
                           </
                    <label>
                <span>{{ t('demands.priority') }}</span>
                <Select
                    v-model="form.priority"
    :options="priorityOpti
                        option-label="la
                        option-value=

            fluid

              </label
  iv>


             type="submit"
        edit demands.save') : t('d "
                :icoan
          i-check
        i-plus'"

    ing="is
    ting"
                :disab
      Subm tting"
              subm t-button"
            />
            <Button

         v-ifmandId"
                 n"
                :label="t('demands.cancelE

       text

               class="cancel-button
                @click="cancelEdit ng"
            />
          </form>
        </aside>
   section>

    main>

    <footer c
      ite-footer"
      <div class="f
        nd">
             src="/favicon.png" a brand-logo small">
        <d
             <strong>workhub</s
                <span>{{ t('demands.footerTa}
               </d
              >
      <p>{{ t('d xt') }}</p>
      <a href="#page-t ds.backToTop' pi pi-arrow-up"/>
              er>

    <Teleport to="body">
      < ="delete-moda

                v-i ="selectedDemand"

              -moda
                       role="present tion"
            @click.s lf="cl

        >
          <section
              ref="det ilsModa
                clas
               detail -modal"
              role "dialog"
              aria-modal="true"
      y="details-modal-title"
    x= -1"
          >
     class="de
            ader">

            iv>
                <p class="kicke
              s.de ailsKicker') }}</p>
                <h2 id="d tails-modal-title">{{ selectedDemand.title }}</h2>
              </div>
              <button class="delete-modal-close" type="button" :aria-label="t('demands.
                              @click="closeDemandDetails">
                <i class="pi pi-times"/>
              </button>
            </header>

            <div class="details-modal-conte
                  <d
              s-stamps"
                 <span :class="['status-stamp', `status
                .stat s.toLowerCase()}`]">
            Labels[sel
              us] }}
                </span>
                <spanty-mar ', `priority-${selected emand.p
                se()} ]">
                  {{ priorityLa els[seiority] }}
               </ pan>
              </

                   <s
                       < 3>{{ t('demands.descr ption')
                         p>{{ selectedDemand.descri tion }}</p>
              </section>



                f="sel
                vatio
                            <h3>{{ t('demands.r viewNot
                           <p>{{ selectedDemand. bservationsToReview }}</p>

                    </s


              ils-m

                         <dt>{{ t('demands.deadl
                               <dd><i class="pi pi-c lendar"/>{{ f rmatDeadline(selectedDemand.
                </di >

               <div>

               <dt>{{ t('demands.createdAt') }} /dt>
                  <dd><i class="pi pitD te(selectedDemand.crea
                              </div>

              l>


                         <footer class="delete-modal-f oter">
              <button class="modal-buyp ="button" @click="clo
                {{ t( de
              }

            on>

          utton clas
        button
      type="button"
      "editSelect dDemand">

        clas il"/>
                {{ t(' ) }}
              </button>
  <button class="mod tructive" type="button" @click=l
          ">
      lass="pi pi-trash
           {{ t('demands.r
                </b
          </footer>
    n>
        </div>
      </Transition

      ition name="delete-modal">
        <div
    isDeleteDialo

            ss="del te-modal-backdrop"

              tatio
                li k.self="closeDele eDialog"
        >
          <se
                    ef="deleteModal"
              class="delete-modal"
                         alog"

              ria-mod l="true"
              ari -labelledby=" elete-modal-title"
              aria-describedby="dele
                                   tabindex="-1"

                       <header class="deer">

            v>

            lass "kicker">{{ t('demands.delete
                <h2 id="delete-mo al-title">{{ t('demands.dele
              2>
  >
              <button class="delete- odal-close"
                ri -label="t('demands.close')" :d "
                      @click="closeD le eDial g">
                <  class
                              </button>
            </ ea

                 <di-modal

            ass="de ete-modal-icon"><i class="pi
              pan>
              <div>
                <strong>{{  ('demands.deleteQuesti n') }}</strong>
            e- odal-description"

                {{ t('d
              scripti nStart') }} <b>{{ demandToDelete .title }}</b>
                                        {{ t 'demands.deleteDescrip
                            </p>
              </div>
            </div>

         =" elete-moda - ooter">
              < utton class="modal- ut
              type="but
            d="isDele
          k="closeDe
        g">

             {{ t('
    ds.keep') }

      </but
n>
              <button class= modal-butt n destruc ive" type="butto " :disable ="isDelet ng"  clic ="dele
eDeman ">
                <i :class="
sDelet ng ? 'pi  i-sp n pi-spinner' : 'pi p
-trash "/>
                {{ isDelet
ng ? t 'demands dele ing') : t('demands.r
move') }
  }

        </button>

  </fo ter>
          < section>
        </div>
      <
Transi ion>
    </Tel port
  </div>
</template>

<script set
p lang "
  ts">
  import
  comp ted, nextTick, onBeforeUnmount,
nMount d, rea tive  ref} from
vue';
 mport Button f om ' rimevue/button';
import I
putTex  from 'primevue/ nput ext';
import Select from 'p
imevue sele t
  ';
  impo t Textarea from 'primevue/tex area';
impo t {useToast} f
r m 'p imevue/usetoast';
import The
eToggl  from '@/compone ts/ThemeToggle.vu ';
i port LanguageSelect

rom ' /comp n nts/Languag
Selec .vue';
impor   useLanguage
 from '@/composa l s/use-langu
ge.ts ;
import router from  @ router';
im
ort { seAuthStore} f o  '@/stores a th-store.ts'

impo t {useDeman S ore} from '@/st r s/demand-sto
e.ts'
import type { e and, Deman P iority, Dema
dStat s, EditDeman , RegisterDemand} f om '@/types/
emand /Demand.t '
import {showEr
orToa t, showSucc s Toast} from '@/ut
ls/to st.ts';

    c nst toast = use o st();
const
sSubm tting = ref(fal e ;
const is e eting = ref(
alse)

  const isD l
e e ialogVisible =
ef(fa se);
const d m ndToDelete = ref<Demand | nul >(null);
co st de
  eModal = ref<HTMLElement | nu (null);
 onst selectedDemand  ef<Deman  | null>(null);
cons etail Modal = ref<HTMLE
emen
| nul >(null);
const a thStore = useAuthStore();
const demandStore =  se
  andS ore();
const formC  = ref< TMLElement | null>(nu ;
con t editingDemandId = f<strin  | null>(null);
const
{lan
age,  } = useLangua e );

const s at sLabels = computed<Record<DemandStatus, string> (() =>  {
  PENDING  t('status
PENDI G'),
  ONGOING: t(' t tus.ONGOING ),
     O
      CKED:  ('stat s.BLOC ED'),
  DONE: t('statu
    s. E'),
}));

const prioriyLa
els = computed<Record D mandPriorit ,  tring>>(() => ({
  LOW: t('priority.LOW'),
  MEDI M: t('p io it
  y.MEDI M'),

  HIG
: t(' riority.HIGH'),
  UR E T: t('priority.U G NT'),
}));

co
t sta usOptions = com uted(() => Obj ct en
  es(sta usL ls.value).ma (([ ue, label ) =>  alue, l bel})));
c t statusF lterOptio = computed(() => [
  {valu
: '
L', l bel: t 'demands.allStatus')},
  ...statusOpti
s.val e,
]);
c n t priorityO ti n
   comp ted( ) => Object.entries(pri
  tyLabe s.va u ).map(([value, label]) => ({value, l b l})));
const prior
tyF
lterO tions = comp t d(() => [
  {v l
   'ALL , la e : t('demands.allPrior
  es')},
        .. p iorityOptions.value,
]);
const selectedStatusFilter = r f Deman
Sta
us |  ALL'>('ALL )
const sele te Pri rityFilter = ref<DemandPriority | ' L
  ('AL ');

const ptyFor  = ():
RegisterDeman  => ({

itle: '',
  descri t on: '',
  d ad ine: null,
  status: 'PENDING
                                           ',
                                             p
                                         ri ri y: 'ME IUM ,
  observationToRe
iew:  ull,
});

c n t form = re ct ve<RegisterDemand>(emptyForm(
                                                       ));

                                                       con
                                                     st us rName =  omp ted(() => {
  cons
 user = authSto e userLogged;
       eturn user ? `${user.firstName} ${use .l stName ` : t('demands.user'
;
});
    const userIn t als = compu ed (
      > {
 const u er   authStore.userLogged;
  retu n us
      ? `${u er.firstName[0]}${user.lastName[0]}`.t UpperCas () : 'WH';
 );
          const to a Label =  ompute (() => new Intl.Dat
    Tim
ormat language.va u , {
  day:  2 di it ,
  month  'long
 ).for at(new Date()));
const ongoingC
   = computed(() => d m
    ore.demands.filter(({ tatus}) => status === 'O
  I
G'
lengt );
const urgentCo n  = co p
  d(() => demandStore.dema d .filter(({priority}) => pr ori y === ' RGEN ' .length);
const doneCount =
  mputed () => demandSto
e.
mands filter(({s a us})  >  ta u
  == 'DONE').length);
con erdueCo
  = computed(() => {
        const
  day = new Da e ).toISOString().slice ;
        ret rn demandStore.demands.filter(({deadline, sta us}) => deadlin a line   today && status !== 'DONE').length;
}

  co st loadDemands = a
    (page = 0) => {
  con t result = await
    dStore.fetchDemand ( age);

     (resul
  s
  r) {
      showErr
  oast(toast, t('demands. oadError'));
  }


  cons  applyFilters = () => {
  demandStore
  atusFilter = selec e Status
il
r.val e === 'ALL'    ull : selected ta us
  ter.va ue;
  deman ore.priority ilter = selectedP rityFilte .value === 'AL ? null   selectedPri tyFilter. alue;
  return adDemands(0);
};

con t saveDemand = async () =
 {

if (i Submitting.v l e)
    r turn;

  i S
  itting.value = true;
   onst resul
   editingDemandId.va u
       ? a ait demandSto itDemand(edi ingDemandId.value,  tDemand()
      : await d Store.r gisterDemand({ rm});

   f (result.isErro
        showErrorToast(t ast, result.response);
     sS bmitt
  .va
   = false;

 r
urn;
  }

  cancelE i in ()

  howSuccessToast(toast   esult
  sponse);
  await lo dDemands(dema
dS
re.cu rentPage);
  is u mitti g.value   false;
    };

  st toEditDemand = ()   ditDema
  => ({
   title: form.title,
   escri
  on: f rm.descript
  ,
    deadline: form.deadline


tatus  form.status,
  p i rity: form.pri rity,
  ob e
  tionsToReview: form. b ervatio
  Revie ,
});

cons
  tartEditing = (demand: Deman
)
 {
   ditingDemandId.val e =  em n
  d;
    Object.assign(f r , {


tle:  emand.title,
    d s ri ti n
  emand descri t on,
    deadline: dem
  .d adline,
  atus: d
  d.status,
      priorit
  demand.priority,

bs
vatio ToReview: demand.obs r at on T
  view  ? null
  });
  focusForm();
}

  co st cancel ng = ()
  {
  editingDemandId.v
  e = null;
    Object.assig
(f
m, em tyForm());
};

co s  c nf r
  le ion = async (deman mand) =
    demandToDelete.value = de a d;
  i
  leteDialogVisible.va u  = tr
e;
 awai  nextTick();
      delet Mo al v
  e?.fo us();
 ;

      const openDemandDeta
   = async (d ma d: Demand) => {
  ctedDem
  value = demand;
   wait
  tTick );
  d t ilsMo al.value?.focus();
};

const closeDe
  De ails = () => {
  s
    edDemand.value = null
};

const editSe
    dDemand = () =>
  const
    nd = se
  t
  ma d.value;
  if (!demand
    return;

 seDemandDetails(
   star Edit n (demand);
};

const delete ele t dD mand = () => {
  const  e a l ctedDemand.value;
  if  ! e
         return;

  closeDemandD
  ls();
    confirmDeletion demand);
};

cons
  loseD leteDialog = () =>
    if (isDeleting v lue)

  return;

 isDeleteD
al
Visib e.value = false;
  demand o elete.v lue = null;
};

    c n
  de eteDemand   as nc () =>

    st demand = demandToD
    .value;
      if (!deman
  |
is
letin .value)
    re u n;

  isDe eting. a ue =  ru ;
  co st result = t dema dStore.deleteDemand(dema
  d);

 if  result.isError) {
    showErrorToas (toast, re ult.response);
    isDeleting.value = false;
    r
tu
;
  }

      if (edi i gDeman Id.valu  = = d mand.id)
    cancelEditing();

  const page =  emandStore.d
ands. ength === 1 && de a
  tore.currentPage > 0
      ? dem
    andStore. urrentPag  - 1
      : d
  ema
dS
re.cu rentPa e

  s ow uc e
  oast(toast, result.
  ponse ;
  await loadDema ds(page);

 i
eleting.valu  = f
  e;
    closeDele
  ialog();
};

const closeDeleteDial gOnEscape = (event: Keyboar
Eve
) => {
  if (event ke  === 'Escape') {
    closeDemandDetai s();
    closeDeleteDialog()
  }
};


nst fo matDeadline

=
(
deadline: string | null

)
=
> {
  if (! deadline) return t('demands.noDeadline');

  return new Intl.

DateTimeFormat(language . value, {
  timeZone: 'UTC'
}) . format(new Date(` ${deadline} T00: 00: 00 Z `));
}

;

const formatDate

=
(
date: string

)
=
> new Intl.

DateTimeFormat
(
language.value

)
.

format
(
new

Date
(
date

)
)
;

const focusForm

=
(
)
=
> {
  formCard.value? .

scrollIntoView( {
  behavior: 'smooth',
  block: 'start'
});
}

;

const logout

=
async

(
)
=
> {
  authStore.

logout();

  await router.

push( {
  name: 'Login'
});
}

;

onMounted
(
(
)
=
> {
loadDemands();

  window.

addEventListener('keydown', closeDeleteDialogOnEscape);
}

)
;

onBeforeUnmount
(
(
)
=
> window.

removeEventListener
(
'keydown'
,
closeDeleteDialogOnEscape

)
)
;
<
/
script >

<
style scoped >
* {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

.demands-page {
  --panel-strong-bg: #fbfbf7;
  --panel-strong-bg-hover: #f4f4ee;
  --panel-strong-field: #ffffff;
  --panel-strong-border: #d9dcd6;
  --panel-strong-heading: #26332f;
  --panel-strong-text: #65716c;
  --panel-strong-muted: #919a96;
  --panel-accent: #6e63d9;
  --panel-accent-hover: #5e53ca;
  --panel-accent-contrast: #ffffff;
  --footer-bg: #e7e7e1;
  --footer-heading: #26332f;
  --footer-text: #707a76;
  --footer-link: #5e53ca;
  min-height: 100dvh;
  scroll-margin-top: 16px;
  color: #17251f;
  background: #f1f0eb;
}

.site-header {
  padding: 22px clamp(18px, 5vw, 76px) 0;
  pointer-events: none;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1360px;
  min-height: 72px;
  margin: 0 auto;
  padding: 9px 12px;
  border: 1px solid rgba(33, 59, 49, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.93);
  box-shadow: 0 15px 35px rgba(42, 55, 49, 0.1);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}

.brand, .navbar-center, .navbar-actions, .profile-copy, .demand-meta, .pagination, .pagination div, .footer-brand {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  color: #173e32;
  font-weight: 800;
  text-decoration: none;
}

.brand-logo {
  width: 50px;
  height: 50px;
  border-radius: 15px 15px 15px 5px;
  object-fit: cover;
  box-shadow: 0 5px 13px rgba(32, 43, 77, 0.2);
}

.brand-logo.small {
  width: 38px;
  height: 38px;
  border-radius: 11px 11px 11px 4px;
}

.brand-copy {
  font-size: 1.02rem;
  letter-spacing: -0.05em;
}

.brand-copy span {
  color: #f07849;
}

.navbar-center {
  gap: 5px;
  padding: 4px;
  border-radius: 17px;
  background: #f5f5f1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border-radius: 13px;
  color: #778078;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: 160ms ease;
}

.nav-link:hover, .nav-link.active {
  color: #173e32;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(27, 53, 43, 0.07);
}

.nav-link.muted {
  cursor: default;
  opacity: 0.52;
}

.nav-link.muted:hover {
  color: #778078;
  background: transparent;
  box-shadow: none;
}

.navbar-actions {
  gap: 7px;
}

.navbar-actions :deep(.p-button) {
  color: #66726b;
}

.navbar-divider {
  width: 1px;
  height: 28px;
  margin: 0 7px;
  background: #e4e5df;
}

.profile-copy {
  align-items: flex-end;
  flex-direction: column;
  max-width: 170px;
  font-size: 0.76rem;
  line-height: 1.25;
}

.profile-copy span {
  overflow: hidden;
  max-width: 100%;
  color: #8c938e;
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  color: #ffffff;
  background: #ef774c;
  font-size: 0.72rem;
  font-weight: 900;
}

.workspace {
  width: min(1380px, 100%);
  margin: 0 auto;
  padding: 68px clamp(18px, 5vw, 76px) 80px;
}

.desk-header, .section-heading, .demand-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.edition, .kicker {
  color: #77857e;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.edition span {
  padding: 0 7px;
  color: #ef774c;
}

h1, h2, h3, p {
  margin: 0;
}

h1 {
  margin-top: 12px;
  color: #153c31;
  font-family: Georgia, serif;
  font-size: clamp(3.5rem, 8vw, 7.2rem);
  font-weight: 400;
  letter-spacing: -0.095em;
  line-height: 0.88;
}

h1 em {
  color: #ef774c;
  font-weight: 400;
}

.header-aside {
  display: grid;
  max-width: 270px;
  justify-items: start;
  gap: 20px;
  padding-top: 30px;
}

.header-aside p {
  color: #69766f;
  font-size: 0.91rem;
  line-height: 1.65;
}

.new-demand-button, .submit-button {
  border: 0;
  color: #dfff7a;
  background: #124b3a;
  font-weight: 800;
}

.new-demand-button:not(:disabled):hover, .submit-button:not(:disabled):hover {
  background: #0b3b2d;
}

.pulse {
  display: flex;
  align-items: stretch;
  gap: 26px;
  margin: 52px 0 28px;
  padding: 13px 20px;
  border-top: 1px solid #d2d5cf;
  border-bottom: 1px solid #d2d5cf;
}

.pulse-label {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 135px;
  color: #315248;
  font-size: 0.73rem;
  text-transform: uppercase;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9acb35;
  box-shadow: 0 0 0 4px rgba(154, 203, 53, 0.18);
}

.pulse dl {
  display: grid;
  width: 100%;
  margin: 0;
  grid-template-columns: repeat(5, 1fr);
}

.pulse dl div {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  padding: 3px 14px;
  border-left: 1px solid #d9dcd6;
}

.pulse dt {
  color: #85908b;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.pulse dd {
  margin: 0;
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 355px);
  gap: 24px;
  align-items: start;
}

.list-board, .intake {
  border: 1px solid #dcddd8;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 252, 0.78);
  box-shadow: 0 15px 32px rgba(48, 66, 58, 0.05);
}

h2 {
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1.7rem;
  font-weight: 400;
  letter-spacing: -0.05em;
}

.list-heading {
  padding: 22px 24px;
  border-bottom: 1px solid #dcddd8;
}

.list-heading-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.status-filter {
  min-width: 168px;
}

.status-filter :deep(.p-select-label) {
  padding-block: 8px;
  font-size: 0.78rem;
}

.list-heading :deep(.p-button) {
  color: #54746a;
}

.empty-state {
  display: grid;
  min-height: 330px;
  padding: 35px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: #84908b;
  text-align: center;
}

.empty-state i {
  color: #719348;
  font-size: 1.7rem;
}

.demand-list {
  display: grid;
}

.demand-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e3df;
  outline: 0;
  cursor: pointer;
  transition: background 160ms ease;
}

.demand-item:hover, .demand-item:focus-visible {
  background: #fbfcf6;
}

.demand-item:focus-visible {
  box-shadow: inset 3px 0 #6e63d9;
}

.demand-index {
  color: #b7bdb7;
  font-family: Georgia, serif;
  font-size: 0.92rem;
}

.demand-main {
  min-width: 0;
}

.demand-title-row {
  justify-content: flex-start;
}

.demand-item h3 {
  overflow: hidden;
  color: #213b33;
  font-size: 0.94rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demand-item p {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: #748078;
  font-size: 0.82rem;
  line-height: 1.52;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.demand-item .review-note {
  color: #8f613e;
  font-size: 0.76rem;
}

.review-note i {
  margin-right: 6px;
  color: #ef774c;
}

.demand-meta {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 11px;
  color: #9ba39e;
  font-size: 0.68rem;
}

.demand-meta span {
  display: flex;
  gap: 5px;
}

.priority-mark, .status-stamp {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  font-size: 0.61rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.priority-mark {
  padding-left: 8px;
  border-left: 2px solid currentColor;
}

.status-stamp {
  padding: 6px 8px;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.demand-actions {
  display: grid;
  justify-items: end;
  align-content: start;
  gap: 6px;
}

.demand-actions :deep(.p-button) {
  width: 28px;
  height: 28px;
  color: #668178;
}

.demand-actions :deep(.p-button:hover) {
  color: #173e32;
  background: #eef1eb;
}

.priority-low {
  color: #8a9690;
}

.priority-medium {
  color: #66813c;
}

.priority-high {
  color: #c27033;
}

.priority-urgent {
  color: #c34843;
}

.status-pending {
  color: #7f8b86;
}

.status-ongoing {
  color: #377b67;
}

.status-blocked {
  color: #c34843;
}

.status-done {
  color: #66813c;
}

.pagination {
  justify-content: space-between;
  padding: 11px 18px;
  color: #8b9691;
  background: #fafaf7;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pagination div {
  gap: 3px;
}

.pagination :deep(.p-button) {
  color: #42685d;
}

.intake {
  position: sticky;
  top: 116px;
  padding: 22px;
  background: var(--panel-strong-bg);
}

.intake-heading {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--panel-strong-border);
}

.intake-heading h2 {
  margin-top: 5px;
  color: var(--panel-strong-heading);
}

.intake-heading .kicker {
  color: var(--panel-accent);
}

.intake-heading p:last-child {
  margin-top: 8px;
  color: var(--panel-strong-text);
  font-size: 0.78rem;
}

.demand-form {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.demand-form label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--panel-strong-text);
  font-size: 0.71rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.demand-form small {
  color: var(--panel-strong-muted);
  font-size: 0.64rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.demand-form :deep(.p-inputtext), .demand-form :deep(.p-textarea), .demand-form :deep(.p-select) {
  width: 100%;
  border-color: var(--panel-strong-border);
  border-radius: 3px;
  color: var(--panel-strong-heading);
  background: var(--panel-strong-field);
  font-size: 0.8rem;
}

.demand-form :deep(.p-inputtext:enabled:focus), .demand-form :deep(.p-textarea:enabled:focus), .demand-form :deep(.p-select.p-focus) {
  border-color: var(--panel-accent);
  box-shadow: 0 0 0 3px rgba(110, 99, 217, 0.12);
}

.demand-form :deep(.p-select-label) {
  color: var(--panel-strong-heading);
}

.demand-form :deep(.p-inputtext::placeholder), .demand-form :deep(.p-textarea::placeholder) {
  color: var(--panel-strong-muted);
}

.submit-button {
  margin-top: 4px;
  color: var(--panel-accent-contrast);
  background: var(--panel-accent);
}

.submit-button:not(:disabled):hover {
  color: var(--panel-accent-contrast);
  background: var(--panel-accent-hover);
}

.cancel-button {
  color: var(--panel-strong-text);
}

.cancel-button:not(:disabled):hover {
  color: var(--panel-strong-heading);
  background: var(--panel-strong-bg-hover);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px clamp(18px, 5vw, 76px);
  color: var(--footer-text);
  background: var(--footer-bg);
}

.footer-brand {
  gap: 10px;
}

.footer-brand div {
  display: grid;
}

.footer-brand strong {
  color: var(--footer-heading);
  font-size: 0.9rem;
}

.footer-brand span, .site-footer p, .site-footer a {
  color: var(--footer-text);
  font-size: 0.7rem;
}

.site-footer a {
  color: var(--footer-link);
  font-weight: 800;
  text-decoration: none;
}

.delete-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: min(18vh, 150px) 18px 24px;
  background: rgba(18, 56, 46, 0.48);
  backdrop-filter: blur(2px);
}

.delete-modal {
  width: min(100%, 500px);
  border: 1px solid #d7d9d3;
  border-radius: 4px;
  overflow: hidden;
  outline: 0;
  background: #fbfbf7;
  box-shadow: 0 24px 55px rgba(23, 62, 50, 0.22);
}

.details-modal {
  width: min(100%, 680px);
}

.details-modal-content {
  display: grid;
  gap: 20px;
  max-height: min(62dvh, 620px);
  padding: 22px;
  overflow-y: auto;
}

.details-stamps {
  display: flex;
  align-items: center;
  gap: 12px;
}

.details-modal-content h3 {
  color: #213b33;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.details-modal-content p {
  margin-top: 7px;
  color: #63736d;
  font-size: 0.9rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.details-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.details-meta div {
  padding: 12px;
  border: 1px solid #e1e3de;
  background: #f6f6f1;
}

.details-meta dt {
  color: #8b9691;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.details-meta dd {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 7px 0 0;
  color: #42685d;
  font-size: 0.8rem;
  font-weight: 700;
}

.delete-modal-header, .delete-modal-content, .delete-modal-footer {
  display: flex;
}

.delete-modal-header {
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 15px;
  border-bottom: 1px solid #e1e3de;
}

.delete-modal-header h2 {
  margin-top: 4px;
  font-size: 1.45rem;
}

.delete-modal-close {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: #789087;
  background: transparent;
  cursor: pointer;
}

.delete-modal-close:not(:disabled):hover {
  color: #173e32;
  background: #eef1eb;
}

.delete-modal-content {
  gap: 14px;
  align-items: flex-start;
  padding: 22px;
}

.delete-modal-icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(239, 119, 76, 0.28);
  border-radius: 50%;
  color: #c45436;
  background: #fff2ea;
}

.delete-modal-content strong {
  color: #213b33;
  font-family: Georgia, serif;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.delete-modal-content p {
  margin-top: 7px;
  color: #748078;
  font-size: 0.84rem;
  line-height: 1.55;
}

.delete-modal-footer {
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px 18px;
  border-top: 1px solid #e1e3de;
  background: #f6f6f1;
}

.modal-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 13px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.modal-button:disabled, .delete-modal-close:disabled {
  cursor: wait;
  opacity: 0.66;
}

.modal-button.secondary {
  color: #6c7e77;
  background: transparent;
}

.modal-button.secondary:not(:disabled):hover {
  color: #173e32;
  background: #eaeee8;
}

.modal-button.destructive {
  border-color: #c45436;
  color: #ffffff;
  background: #c45436;
}

.modal-button.edit {
  border-color: #6e63d9;
  color: #ffffff;
  background: #6e63d9;
}

.modal-button.edit:hover {
  border-color: #5e53ca;
  background: #5e53ca;
}

.modal-button.destructive:not(:disabled):hover {
  border-color: #aa432a;
  background: #aa432a;
}

.delete-modal-enter-active, .delete-modal-leave-active {
  transition: opacity 160ms ease;
}

.delete-modal-enter-active .delete-modal, .delete-modal-leave-active .delete-modal {
  transition: transform 160ms ease, opacity 160ms ease;
}

.delete-modal-enter-from, .delete-modal-leave-to {
  opacity: 0;
}

.delete-modal-enter-from .delete-modal, .delete-modal-leave-to .delete-modal {
  opacity: 0;
  transform: translateY(-8px);
}

:global(.app-dark .demands-page) {
  --panel-strong-bg: #171b2b;
  --panel-strong-bg-hover: #111624;
  --panel-strong-field: #101522;
  --panel-strong-border: rgba(214, 220, 244, 0.16);
  --panel-strong-heading: #f7f5ef;
  --panel-strong-text: #c5ccdf;
  --panel-strong-muted: #8993ad;
  --panel-accent: #8876ff;
  --panel-accent-hover: #9d8dff;
  --panel-accent-contrast: #ffffff;
  --footer-bg: #101522;
  --footer-heading: #f7f5ef;
  --footer-text: #929cb4;
  --footer-link: #a496ff;
  color: #dbe3df;
  background: #0d1420;
}

:global(.app-dark .navbar) {
  border-color: rgba(214, 220, 244, 0.12);
  background: rgba(20, 27, 42, 0.94);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

:global(.app-dark .brand),
:global(.app-dark .nav-link:hover),
:global(.app-dark .nav-link.active),
:global(.app-dark h1),
:global(.app-dark h2),
:global(.app-dark .pulse dd),
:global(.app-dark .demand-item h3) {
  color: #e8efec;
}

:global(.app-dark .navbar-center),
:global(.app-dark .demand-actions .p-button:hover) {
  background: #111927;
}

:global(.app-dark .nav-link:hover),
:global(.app-dark .nav-link.active) {
  background: #202b3c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
}

:global(.app-dark .navbar-divider),
:global(.app-dark .pulse dl div) {
  border-color: rgba(214, 220, 244, 0.13);
}

:global(.app-dark .navbar-divider) {
  background: rgba(214, 220, 244, 0.13);
}

:global(.app-dark .pulse) {
  border-color: rgba(214, 220, 244, 0.16);
}

:global(.app-dark .list-board),
:global(.app-dark .intake) {
  border-color: rgba(214, 220, 244, 0.14);
  background: rgba(20, 27, 42, 0.88);
  box-shadow: 0 15px 32px rgba(0, 0, 0, 0.14);
}

:global(.app-dark .list-heading),
:global(.app-dark .demand-item) {
  border-color: rgba(214, 220, 244, 0.12);
}

:global(.app-dark .demand-item:hover),
:global(.app-dark .pagination) {
  background: #111927;
}

:global(.app-dark .delete-modal-backdrop) {
  background: rgba(4, 9, 17, 0.7);
}

:global(.app-dark .delete-modal) {
  border-color: rgba(214, 220, 244, 0.16);
  background: #171b2b;
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.32);
}

:global(.app-dark .delete-modal-header),
:global(.app-dark .delete-modal-footer) {
  border-color: rgba(214, 220, 244, 0.14);
}

:global(.app-dark .delete-modal-footer) {
  background: #111624;
}

:global(.app-dark .delete-modal-content strong) {
  color: #f7f5ef;
}

:global(.app-dark .delete-modal-content p) {
  color: #aab5c9;
}

:global(.app-dark .details-modal-content h3) {
  color: #f7f5ef;
}

:global(.app-dark .details-modal-content p) {
  color: #c5ccdf;
}

:global(.app-dark .details-meta div) {
  border-color: rgba(214, 220, 244, 0.14);
  background: #111624;
}

:global(.app-dark .details-meta dd) {
  color: #aab5c9;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .intake {
    position: static;
  }
}

@media (max-width: 700px) {
  .site-header {
    padding: 12px 12px 0;
  }

  .navbar {
    min-height: 62px;
    padding: 6px 8px;
    border-radius: 18px;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
  }

  .brand-copy, .profile-copy, .navbar-divider, .navbar-actions > :deep(.p-button:first-child), .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 10px 12px;
  }

  .workspace {
    padding: 46px 16px 52px;
  }

  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .list-heading-actions, .status-filter {
    width: 100%;
  }

  .list-heading-actions {
    justify-content: space-between;
  }

  .desk-header {
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: clamp(3.8rem, 18vw, 5.7rem);
  }

  .header-aside {
    max-width: 100%;
    padding-top: 0;
  }

  .pulse {
    display: grid;
    gap: 13px;
    margin-top: 36px;
    padding: 13px 0;
  }

  .pulse dl {
    grid-template-columns: repeat(5, auto);
  }

  .pulse dl div {
    display: grid;
    justify-content: start;
    gap: 3px;
    padding: 0 8px;
  }

  .demand-item {
    grid-template-columns: 24px minmax(0, 1fr);
    padding: 17px 15px;
  }

  .status-stamp {
    grid-column: auto;
  }

  .demand-actions {
    grid-column: 2;
    justify-items: start;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .pulse {
    overflow-x: auto;
  }

  .pulse dl {
    min-width: 430px;
  }

  .details-meta {
    grid-template-columns: 1fr;
  }

  .details-modal .delete-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .details-modal .modal-button {
    justify-content: center;
  }
}
</style>
